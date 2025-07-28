import { ActionParameters, WebAppKind, appKindMap } from "../actionparameters";

import * as core from "@actions/core";
import { AzureResourceFilterUtility } from "azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility";
import { DEPLOYMENT_PROVIDER_TYPES } from "../DeploymentProvider/Providers/BaseWebAppDeploymentProvider";
import { IValidator } from "./ActionValidators/IValidator";
import { PublishProfileWebAppValidator } from "./ActionValidators/PublishProfileWebAppValidator";
import { PublishProfileContainerWebAppValidator } from "./ActionValidators/PublishProfileContainerWebAppValidator";
import { SpnLinuxContainerWebAppValidator } from "./ActionValidators/SpnLinuxContainerWebAppValidator";
import { SpnLinuxWebAppValidator } from "./ActionValidators/SpnLinuxWebAppValidator";
import { SpnWindowsContainerWebAppValidator } from "./ActionValidators/SpnWindowsContainerWebAppValidator";
import { SpnWindowsWebAppValidator } from "./ActionValidators/SpnWindowsWebAppValidator";
import { appNameIsRequired } from "./Validations";
import { PublishProfile } from "../Utilities/PublishProfile";
import RuntimeConstants from "../RuntimeConstants";
import { SpnWebAppSiteContainersValidator } from "./ActionValidators/SpnWebAppSiteContainersValidator";
import { AzureAppService } from "azure-actions-appservice-rest/Arm/azure-app-service";

export class ValidatorFactory {
    public static async getValidator(type: DEPLOYMENT_PROVIDER_TYPES) : Promise<IValidator[]> {
        let actionParams: ActionParameters = ActionParameters.getActionParams();
        let validators: IValidator[] = [];
        if (type === DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            if (!!actionParams.siteContainers) {
                throw new Error("publish-profile is not supported for Site Containers scenario");
            } else if (!!actionParams.images) {
                await this.setResourceDetails(actionParams);
                validators.push(new PublishProfileContainerWebAppValidator());
            }
            else {
                validators.push(new PublishProfileWebAppValidator());
            }
            return validators;
        }
        else if(type == DEPLOYMENT_PROVIDER_TYPES.SPN) {
            // app-name is required to get resource details
            core.info("Validating app name is required for SPN deployment");
            appNameIsRequired(actionParams.appName);
            await this.getResourceDetails(actionParams);
            core.info("validated app details");
            if (!!actionParams.isLinux) {
                core.info("Validating Linux app details");
                if (!!actionParams.siteContainers) {
                    core.info("Validating site containers app details");
                    validators.push(new SpnWebAppSiteContainersValidator());

                    if (await this.isBlessedSitecontainerApp(actionParams)) {
                        core.info("Validating blessed site containers app details");
                        validators.push(new SpnLinuxWebAppValidator());
                    }
                }
                else if (!!actionParams.images || !!actionParams.multiContainerConfigFile) {
                    validators.push(new SpnLinuxContainerWebAppValidator());
                }
                else {
                    validators.push(new SpnLinuxWebAppValidator());
                }
            }
            else {
                if (!!actionParams.images) {
                    validators.push(new SpnWindowsContainerWebAppValidator());
                }
                else {
                    validators.push(new SpnWindowsWebAppValidator());
                }
            }

            return validators;
        }
        else {
            throw new Error("Valid credentials are not available. Add Azure Login action before this action or provide publish-profile input.");
        }
    }

    private static async getResourceDetails(params: ActionParameters) {
        let appDetails = await AzureResourceFilterUtility.getAppDetails(params.endpoint, params.appName, params.resourceGroupName, params.slotName);
        params.resourceGroupName = appDetails["resourceGroupName"];
        params.realKind = appDetails["kind"];
        params.kind = appKindMap.get(params.realKind);
        //app kind linux and kubeapp is supported only on linux environment currently
        params.isLinux = params.realKind.indexOf("linux") > -1 || params.realKind.indexOf("kubeapp") > -1;
    }

    private static async setResourceDetails(actionParams: ActionParameters) {
        const publishProfile: PublishProfile = PublishProfile.getPublishProfile(actionParams.publishProfileContent);
        const appOS: string = await publishProfile.getAppOS();
        actionParams.isLinux = appOS.includes(RuntimeConstants.Unix) || appOS.includes(RuntimeConstants.Unix.toLowerCase());
    }

    private static async isBlessedSitecontainerApp(actionParams: ActionParameters): Promise<boolean> {
        const appService = new AzureAppService(actionParams.endpoint, actionParams.resourceGroupName, actionParams.appName, actionParams.slotName);

        let config = await appService.getConfiguration();
        
        core.info(`LinuxFxVersion of app is: ${config.properties.linuxFxVersion}`);

        actionParams.blessedAppSitecontainers = (config.properties.linuxFxVersion !== "DOCKER" && config.properties.containerImageName !== "SITECONTAINERS");

        return actionParams.blessedAppSitecontainers;
    }
}
