import * as core from '@actions/core';
import * as utility from 'azure-actions-utility/utility.js';
import * as zipUtility from 'azure-actions-utility/ziputility.js';
import { unlink } from 'fs/promises';
import path from 'path';
import * as fs from 'fs';

import { Package, PackageType } from "azure-actions-utility/packageUtility";

import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { addAnnotation } from 'azure-actions-appservice-rest/Utilities/AnnotationUtility';

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
                    // exluding release.zip while creating zip for deployment.
                    
                    await this.printFilesInDirectory(webPackage);

                    await this.deleteReleaseZip(webPackage);

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

    private async printFilesInDirectory(directoryPath: string) {
        core.info("release files under a folder");
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
            core.info(`Error reading directory: ${err.message}`);
            return;
            }

            files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                core.info(`Error reading file info: ${err.message}`);
                return;
                }

                
                core.info(filePath);
                
            });
            });
        });
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

    private async deleteReleaseZip(folderPath: string) {

        let isPhpApp = await this.containsPhpFiles(folderPath);

        if(!isPhpApp) {
            core.info("No PHP files found in the folder, skipping release.zip deletion.");
            return;
        }

        let releaseZipPath = path.join(folderPath, 'release.zip');

        try {
            await unlink(releaseZipPath);
            core.info(`Deleted: ${releaseZipPath}`);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                core.error(`File does not exist: ${releaseZipPath}`);
            } else {
                core.error(`Error while deleting file ${releaseZipPath}, Error: ${err}`);
            }
        }
    }

    private async containsPhpFiles(directoryPath: string): Promise<boolean> {
        try {
            const files = fs.readdirSync(directoryPath);

            for (const file of files) {
                const fullPath = path.join(directoryPath, file);
                const stat = fs.statSync(fullPath);

                if (stat.isFile() && path.extname(file).toLowerCase() === '.php') {
                    return true;
                }
            }

            return false;
        } catch (error: any) {
            console.error(`Error checking directory: ${error.message}`);
            return false;
        }
    }
}