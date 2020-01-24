import * as core from '@actions/core';
import * as utility from 'azure-actions-utility/utility.js';
import * as zipUtility from 'azure-actions-utility/ziputility.js';

import { Package, PackageType } from "azure-actions-utility/packageUtility";

import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';

export class WebAppDeploymentProvider extends BaseWebAppDeploymentProvider {

    public async DeployWebAppStep() {
        let appPackage: Package = this.actionParams.package;
        let webPackage = appPackage.getPath();

        // kudu warm up
        await this.kuduServiceUtility.warmpUp(); 
        
        let packageType = appPackage.getPackageType();

        switch(packageType){
            case PackageType.war:
                core.debug("Initiated deployment via kudu service for webapp war package : "+ webPackage);    
                var warName = utility.getFileNameFromPath(webPackage, ".war");
                this.deploymentID = await this.kuduServiceUtility.deployUsingWarDeploy(webPackage, 
                    { slotName: this.actionParams.slotName }, warName);
                break;

            case PackageType.jar:
                core.debug("Initiated deployment via kudu service for webapp jar package : "+ webPackage);
                let folderPath = await utility.generateTemporaryFolderForDeployment(false, webPackage, PackageType.jar);
                let output = await utility.archiveFolderForDeployment(false, folderPath);
                webPackage = output.webDeployPkg;
                this.deploymentID = await this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                break;

            case PackageType.folder:
                let tempPackagePath = utility.generateTemporaryFolderOrZipPath(`${process.env.RUNNER_TEMP}`, false);
                webPackage = await zipUtility.archiveFolder(webPackage, "", tempPackagePath) as string;
                core.debug("Compressed folder into zip " +  webPackage);
                core.debug("Initiated deployment via kudu service for webapp package : "+ webPackage); 
                this.deploymentID = await this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                break;
                
            case PackageType.zip:
                core.debug("Initiated deployment via kudu service for webapp package : "+ webPackage); 
                this.deploymentID = await this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                break;

            default:
                throw new Error('Invalid App Service package or folder path provided: ' + webPackage);
        }

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
}