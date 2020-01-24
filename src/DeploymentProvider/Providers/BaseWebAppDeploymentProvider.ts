import * as core from '@actions/core';

import { PublishProfile, ScmCredentials } from '../../Utilities/PublishProfile';

import { ActionParameters } from '../../actionparameters';
import { AzureAppService } from 'azure-actions-appservice-rest/Arm/azure-app-service';
import { AzureAppServiceUtility } from 'azure-actions-appservice-rest/Utilities/AzureAppServiceUtility';
import { IWebAppDeploymentProvider } from './IWebAppDeploymentProvider';
import { Kudu } from 'azure-actions-appservice-rest/Kudu/azure-app-kudu-service';
import { KuduServiceUtility } from 'azure-actions-appservice-rest/Utilities/KuduServiceUtility';
import { addAnnotation } from 'azure-actions-appservice-rest/Utilities/AnnotationUtility';

export abstract class BaseWebAppDeploymentProvider implements IWebAppDeploymentProvider {
    protected actionParams:ActionParameters;
    protected appService: AzureAppService;
    protected kuduService: Kudu;
    protected appServiceUtility: AzureAppServiceUtility;
    protected kuduServiceUtility: KuduServiceUtility;
    protected activeDeploymentID;
    protected authType: DEPLOYMENT_PROVIDER_TYPES;    
    protected applicationURL: string;
    protected deploymentID: string;

    constructor(type: DEPLOYMENT_PROVIDER_TYPES) {
        this.authType = type;
        this.actionParams = ActionParameters.getActionParams();
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

    abstract DeployWebAppStep(): void;

    public async UpdateDeploymentStatus(isDeploymentSuccess: boolean) {
        if(!!this.appService) {
            await addAnnotation(this.actionParams.endpoint, this.appService, isDeploymentSuccess);
        }
        
        this.activeDeploymentID = await this.kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, {'type': 'Deployment', slotName: this.actionParams.slotName});
        core.debug('Active DeploymentId :'+ this.activeDeploymentID);

        if(!!isDeploymentSuccess && !!this.deploymentID && !!this.activeDeploymentID) {
            await this.kuduServiceUtility.postZipDeployOperation(this.deploymentID, this.activeDeploymentID);
        }
        
        console.log('App Service Application URL: ' + this.applicationURL);
        core.setOutput('webapp-url', this.applicationURL);
    }

    private async initializeForSPN() {        
        this.appService = new AzureAppService(this.actionParams.endpoint, this.actionParams.resourceGroupName, this.actionParams.appName, this.actionParams.slotName);
        this.appServiceUtility = new AzureAppServiceUtility(this.appService);
        
        this.kuduService = await this.appServiceUtility.getKuduService();
        this.kuduServiceUtility = new KuduServiceUtility(this.kuduService);

        this.applicationURL = await this.appServiceUtility.getApplicationURL();
    }

    private async initializeForPublishProfile() {
        let publishProfile: PublishProfile = PublishProfile.getPublishProfile(this.actionParams.publishProfileContent);
        let scmCreds: ScmCredentials = publishProfile.creds;
        
        this.kuduService = new Kudu(scmCreds.uri, scmCreds.username, scmCreds.password);
        this.kuduServiceUtility = new KuduServiceUtility(this.kuduService);
        
        this.applicationURL = publishProfile.appUrl;
    }
}

export enum DEPLOYMENT_PROVIDER_TYPES {
    SPN,
    PUBLISHPROFILE
}