"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actionparameters_1 = require("../actionparameters");
const BaseWebAppDeploymentProvider_1 = require("./Providers/BaseWebAppDeploymentProvider");
const WebAppContainerDeployment_1 = require("./Providers/WebAppContainerDeployment");
const WebAppDeploymentProvider_1 = require("./Providers/WebAppDeploymentProvider");
class DeploymentProviderFactory {
    static getDeploymentProvider(type) {
        // For publish profile type app kind is not available so we directly return WebAppDeploymentProvider
        if (type === BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            return new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type);
        }
        else if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN) {
            let kind = actionparameters_1.ActionParameters.getActionParams().kind;
            switch (kind) {
                case actionparameters_1.WebAppKind.Linux:
                case actionparameters_1.WebAppKind.Windows:
                    return new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type);
                case actionparameters_1.WebAppKind.LinuxContainer:
                case actionparameters_1.WebAppKind.WindowsContainer:
                    return new WebAppContainerDeployment_1.WebAppContainerDeploymentProvider(type);
                default:
                    throw new Error("No deployment provider supporting app kind: " + kind);
            }
        }
        else {
            throw new Error("Invalid deployment provider type.");
        }
    }
}
exports.DeploymentProviderFactory = DeploymentProviderFactory;
