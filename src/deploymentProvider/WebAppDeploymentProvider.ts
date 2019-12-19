import * as core from '@actions/core';
import * as utility from 'azure-actions-utility/utility.js';
import * as zipUtility from 'azure-actions-utility/ziputility.js';

import { AzureAppService } from 'azure-actions-appservice-rest/Arm/azure-app-service';
import { AzureAppServiceUtility } from 'azure-actions-appservice-rest/Utilities/AzureAppServiceUtility';
import { IWebAppDeploymentProvider } from './IWebAppDeploymentProvider';
import { Kudu } from 'azure-actions-appservice-rest/Kudu/azure-app-kudu-service';
import { KuduServiceUtility } from 'azure-actions-appservice-rest/Utilities/KuduServiceUtility';
import { PackageType } from "azure-actions-utility/packageUtility";
import { TaskParameters } from '../taskparameters';
import { addAnnotation } from 'azure-actions-appservice-rest/Utilities/AnnotationUtility';

var parseString = require('xml2js').parseString;

interface scmCredentials {
    uri: string;
    username: string;
    password: string;
}

export class WebAppDeploymentProvider implements IWebAppDeploymentProvider {
    private taskParams:TaskParameters;
    private appService: AzureAppService;
    private kuduService: Kudu;
    private appServiceUtility: AzureAppServiceUtility;
    private kuduServiceUtility: KuduServiceUtility;
    private activeDeploymentID;
    private authType: DEPLOYMENT_PROVIDER_TYPES;    
    private applicationURL: string;
    private deploymentID: string;

    constructor(type: DEPLOYMENT_PROVIDER_TYPES) {
        this.authType = type;
        this.taskParams = TaskParameters.getTaskParams();
    }

    public async PreDeploymentStep() {
        switch(this.authType) {
            case DEPLOYMENT_PROVIDER_TYPES.SPN:
                await this.initializeForSPN();
                break;
            case DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE:
                await this.initializeForPublishProfile();
                break;
            default: 
                throw new Error("Invalid deployment provider type");
        }
    }

    public async DeployWebAppStep() {
        let webPackage = TaskParameters.getTaskParams().package.getPath();
        
        let _isMSBuildPackage = await TaskParameters.getTaskParams().package.isMSBuildPackage();           
        if(_isMSBuildPackage) {
            throw new Error('MsBuildPackageNotSupported' + webPackage);
        } 
        let packageType = TaskParameters.getTaskParams().package.getPackageType();

        // kudu warm up
        await this.kuduServiceUtility.warmpUp();

        switch(packageType){
            case PackageType.war:
                core.debug("Initiated deployment via kudu service for webapp war package : "+ webPackage);    
                var warName = utility.getFileNameFromPath(webPackage, ".war");
                this.deploymentID = await this.kuduServiceUtility.deployUsingWarDeploy(webPackage, 
                    { slotName: this.taskParams.slotName }, warName);
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
                
            case PackageType.zip:
                core.debug("Initiated deployment via kudu service for webapp package : "+ webPackage); 
                this.deploymentID = await this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                break;

            default:
                throw new Error('Invalid App Service package or folder path provided: ' + webPackage);
        }
    }

    public async UpdateDeploymentStatus(isDeploymentSuccess: boolean) {
        if(!!this.appService) {
            await addAnnotation(this.taskParams.endpoint, this.appService, isDeploymentSuccess);
        }
        
        this.activeDeploymentID = await this.kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, {'type': 'Deployment', slotName: this.taskParams.slotName});
        core.debug('Active DeploymentId :'+ this.activeDeploymentID);
        if(!!isDeploymentSuccess) {
            await this.kuduServiceUtility.postZipDeployOperation(this.deploymentID, this.activeDeploymentID);
        }
        
        console.log('App Service Application URL: ' + this.applicationURL);
        core.setOutput('webapp-url', this.applicationURL);
    }

    private async initializeForSPN() {        
        this.appService = new AzureAppService(this.taskParams.endpoint, this.taskParams.resourceGroupName, this.taskParams.appName, this.taskParams.slotName);
        this.appServiceUtility = new AzureAppServiceUtility(this.appService);
        
        this.kuduService = await this.appServiceUtility.getKuduService();
        this.kuduServiceUtility = new KuduServiceUtility(this.kuduService);
        
        // setting application url
        this.applicationURL = await this.appServiceUtility.getApplicationURL();
    }

    private async initializeForPublishProfile() {
        let scmCreds: scmCredentials;
        try {
            scmCreds = await this.getCredsFromXml(TaskParameters.getTaskParams().publishProfileContent);
        } catch(error) {
            core.error("Failed to fetch credentials from Publish Profile. For more details on how to set publish profile credentials refer https://aka.ms/create-secrets-for-GitHub-workflows");
            throw error;
        }

        this.kuduService = new Kudu(scmCreds.uri, scmCreds.username, scmCreds.password);
        this.kuduServiceUtility = new KuduServiceUtility(this.kuduService);
    }

    private async getCredsFromXml(pubxmlFile: string): Promise<scmCredentials> {
        let res;
        await parseString(pubxmlFile, (error, result) => {
            if(!!error) {
                throw new Error("Failed XML parsing " + error);
            }
            res = result.publishData.publishProfile[0].$;
        });

        let creds: scmCredentials = {
            uri: res.publishUrl.split(":")[0],
            username: res.userName,
            password: res.userPWD
        };
        
        // masking kudu password
        core.setSecret('${creds.password}');

        if(creds.uri.indexOf("scm") < 0) {
            throw new Error("Publish profile does not contain kudu URL");
        }

        creds.uri = `https://${creds.uri}`;

        // setting application url
        this.applicationURL = res.destinationAppUrl;
        return creds;
    }
}

export enum DEPLOYMENT_PROVIDER_TYPES {
    SPN,
    PUBLISHPROFILE
}