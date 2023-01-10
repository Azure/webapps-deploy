import { ActionParameters, WebAppKind, appKindMap } from "../actionparameters";

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

export class ValidatorFactory {
    public static async getValidator(type: DEPLOYMENT_PROVIDER_TYPES) : Promise<IValidator> {
        let actionParams: ActionParameters = ActionParameters.getActionParams();
        if(type === DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            if (!!actionParams.images) {
                await this.setResourceDetails(actionParams);
                return new PublishProfileContainerWebAppValidator();
            }
            else {
                return new PublishProfileWebAppValidator();
            }
        }
        else if(type == DEPLOYMENT_PROVIDER_TYPES.SPN) {
            // app-name is required to get resource details
            appNameIsRequired(actionParams.appName);
            await this.getResourceDetails(actionParams);
            if (!!actionParams.isLinux) {
                if (!!actionParams.images || !!actionParams.multiContainerConfigFile) {
                    return new SpnLinuxContainerWebAppValidator();
                }
                else {
                    return new SpnLinuxWebAppValidator();
                }
            }
            else {
                if (!!actionParams.images) {
                    return new SpnWindowsContainerWebAppValidator();
                }
                else {
                    return new SpnWindowsWebAppValidator();
                }
            }
        }
        else {
            throw new Error("Valid credentials are not available. Add Azure Login action before this action or provide publish-profile input.");
        }
    }

    private static async getResourceDetails(params: ActionParameters) {
        let appDetails = await AzureResourceFilterUtility.getAppDetails(params.endpoint, params.appName, params.resourceGroupName);
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
}
