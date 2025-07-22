import * as core from '@actions/core';
import * as utility from 'azure-actions-utility/utility.js';
import * as zipUtility from 'azure-actions-utility/ziputility.js';

import { Package, PackageType } from "azure-actions-utility/packageUtility";

import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { addAnnotation } from 'azure-actions-appservice-rest/Utilities/AnnotationUtility';

import fs from 'fs';
import path from 'path';

export class WebAppDeploymentProvider extends BaseWebAppDeploymentProvider {

    public async DeployWebAppStep() {
        let appPackage: Package = this.actionParams.package;
        let webPackage = appPackage.getPath();

        const validTypes = ["war", "jar", "ear", "zip", "static"];

        // kudu warm up
        await this.kuduServiceUtility.warmpUp(); 

        // If provided, type paramater takes precidence over file package type
        if (this.actionParams.type != null && validTypes.includes(this.actionParams.type.toLowerCase())) {
            core.debug("Initiated deployment via kudu service for webapp" + this.actionParams.type + "package : "+ webPackage);
        }

        else {
            // Retains the old behavior of determining the package type from the file extension if valid type is not defined
            let packageType = appPackage.getPackageType();
            switch(packageType){
                case PackageType.war:
                    core.debug("Initiated deployment via kudu service for webapp war package : "+ webPackage);
                    this.actionParams.type = "war";
                    break;
    
                case PackageType.jar:
                    core.debug("Initiated deployment via kudu service for webapp jar package : "+ webPackage);
                    this.actionParams.type = "jar";
                    break;
    
                case PackageType.folder:
                    let tempPackagePath = utility.generateTemporaryFolderOrZipPath(`${process.env.RUNNER_TEMP}`, false);
                    
                    // excluding release.zip while creating zip for deployment if it's a Linux PHP app
                    await this.deleteReleaseZipForLinuxPhpApps(webPackage);

                    webPackage = await zipUtility.archiveFolder(webPackage, "", tempPackagePath) as string;
                    core.debug("Compressed folder into zip " +  webPackage);
                    core.debug("Initiated deployment via kudu service for webapp package : "+ webPackage);
                    this.actionParams.type = "zip";
                    break;
                    
                case PackageType.zip:
                    core.debug("Initiated deployment via kudu service for webapp zip package : "+ webPackage);
                    this.actionParams.type = "zip";
                    break;
    
                default:
                    throw new Error('Invalid App Service package: ' + webPackage + ' or type provided: ' + this.actionParams.type);
            }
        }

        this.deploymentID = await this.kuduServiceUtility.deployUsingOneDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage:this.actionParams.commitMessage }, 
            this.actionParams.targetPath, this.actionParams.type, this.actionParams.clean, this.actionParams.restart);

        // updating startup command
        if(!!this.actionParams.startupCommand) {
            await this.updateStartupCommand();
        }
    }

    private async updateStartupCommand() {
        let currentConfig = await this.appService.getConfiguration();
        let currentStartupCommand = currentConfig.properties.appCommandLine;
        let newStartupCommand = this.actionParams.startupCommand;
        if(currentStartupCommand != newStartupCommand) {
            await this.appServiceUtility.updateConfigurationSettings({ appCommandLine: newStartupCommand});
        }
        else {
            core.debug(`Skipped updating appCommandLine. Current value is: ${currentStartupCommand}`);
        }
    }

    public async UpdateDeploymentStatus(isDeploymentSuccess: boolean) {
        if(!!this.appService) {
            await addAnnotation(this.actionParams.endpoint, this.appService, isDeploymentSuccess);
        }
        
        console.log('App Service Application URL: ' + this.applicationURL);
        core.setOutput('webapp-url', this.applicationURL);
    }

    private async deleteReleaseZipForLinuxPhpApps(webPackage: string): Promise<void> {

        // If the app is not a Linux app, skip the deletion of release.zip
        if (!this.actionParams.isLinux) {
            core.debug(`It's not a Linux app, skipping deletion of release.zip`);
            return;
        }
        
        const releaseZipPath = path.join(webPackage, 'release.zip');

        if (!fs.existsSync(releaseZipPath)) {
            core.debug(`release.zip does not exist, skipping deletion: ${releaseZipPath}`);
            return;
        }

        let isPhpApp = await this.checkIfTheAppIsPhpApp(webPackage);

        // No need to delete release.zip for non-PHP apps
        if (!isPhpApp) {
            core.debug(`Not a PHP app, skipping deletion of release.zip: ${releaseZipPath}`);
            return;
        }

        // Delete release.zip if it exists

        try {
            await fs.promises.unlink(releaseZipPath);
            core.debug(`Deleted release.zip`);
        } catch (error) {
            core.debug(`Error while deleting release.zip for Linux PHP app: ${error}`);
        }
    }

    private async checkIfTheAppIsPhpApp(webPackage: string): Promise<boolean> {

        try {
            // Check if the web package contains a composer.json file
            const composerFile = 'composer.json'; 
            if (fs.existsSync(path.join(webPackage, composerFile))) {
                core.debug(`Detected PHP app by presence of ${composerFile}`);
                return true;
            }

            // Check if the webPackage folder contains a .php file
            core.debug(`Checking for .php files in the web package directory: ${webPackage}`);
            const hasPhpFiles = fs.readdirSync(webPackage, {withFileTypes: true, recursive: true}).some(file => file.isFile() && file.name.endsWith('.php'));
            
            if (hasPhpFiles) {
                core.debug(`Detected PHP app by presence of .php files`);
            } else {
                core.debug(`No .php files found in the web package directory`);
            }
            
            return hasPhpFiles;
        } catch (error) {
            core.debug(`Error while checking if the app is PHP: ${error}`);
        }

       return false;
    }
}