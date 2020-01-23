import { ActionParameters, WebAppKind } from "../actionparameters";

import { DEPLOYMENT_PROVIDER_TYPES } from "./Providers/BaseWebAppDeploymentProvider";
import { IWebAppDeploymentProvider } from "./Providers/IWebAppDeploymentProvider";
import { WebAppContainerDeploymentProvider } from "./Providers/WebAppContainerDeployment";
import { WebAppDeploymentProvider } from "./Providers/WebAppDeploymentProvider";

export class DeploymentProviderFactory {

    public static getDeploymentProvider(type: DEPLOYMENT_PROVIDER_TYPES) : IWebAppDeploymentProvider {
        
        // For publish profile type app kind is not available so we directly return WebAppDeploymentProvider
        if(type === DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            return new WebAppDeploymentProvider(type);
        }
        else if(type == DEPLOYMENT_PROVIDER_TYPES.SPN) {
            let kind = ActionParameters.getActionParams().kind;            
            switch(kind) {
                case WebAppKind.Linux:
                case WebAppKind.Windows:
                    return new WebAppDeploymentProvider(type);
                case WebAppKind.LinuxContainer:
                case WebAppKind.WindowsContainer:
                    return new WebAppContainerDeploymentProvider(type);
                default:
                    throw new Error("No deployment provider supporting app kind: " + kind);
            }
        }
        else {
            throw new Error("Invalid deployment provider type.");
        }
    }
}