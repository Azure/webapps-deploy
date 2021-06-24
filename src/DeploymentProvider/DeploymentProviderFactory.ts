import { ActionParameters, WebAppKind } from "../actionparameters";

import { DEPLOYMENT_PROVIDER_TYPES } from "./Providers/BaseWebAppDeploymentProvider";
import { IWebAppDeploymentProvider } from "./Providers/IWebAppDeploymentProvider";
import { WebAppContainerDeploymentProvider } from "./Providers/WebAppContainerDeployment";
import { WebAppDeploymentProvider } from "./Providers/WebAppDeploymentProvider";
import { PublishProfileWebAppContainerDeploymentProvider } from "./Providers/PublishProfileWebAppContainerDeploymentProvider";

export class DeploymentProviderFactory {

    public static getDeploymentProvider(type: DEPLOYMENT_PROVIDER_TYPES) : IWebAppDeploymentProvider {
        if(type === DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            if (!!ActionParameters.getActionParams().images) {
                return new PublishProfileWebAppContainerDeploymentProvider(type);
            }
            else {
                return new WebAppDeploymentProvider(type);
            }
        }
        else if(type == DEPLOYMENT_PROVIDER_TYPES.SPN) {
            if(!!ActionParameters.getActionParams().images || (!!ActionParameters.getActionParams().isLinux && !!ActionParameters.getActionParams().multiContainerConfigFile)) {
                return new WebAppContainerDeploymentProvider(type);
            }
            else {
                return new WebAppDeploymentProvider(type);
            }
        }
        else {
            throw new Error("Invalid deployment provider type.");
        }
    }
}