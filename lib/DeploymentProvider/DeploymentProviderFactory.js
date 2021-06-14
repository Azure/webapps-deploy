"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actionparameters_1 = require("../actionparameters");
const BaseWebAppDeploymentProvider_1 = require("./Providers/BaseWebAppDeploymentProvider");
const WebAppContainerDeployment_1 = require("./Providers/WebAppContainerDeployment");
const WebAppDeploymentProvider_1 = require("./Providers/WebAppDeploymentProvider");
const PublishProfileWebAppContainerDeploymentProvider_1 = require("./Providers/PublishProfileWebAppContainerDeploymentProvider");
class DeploymentProviderFactory {
    static getDeploymentProvider(type) {
        if (type === BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            if (!!actionparameters_1.ActionParameters.getActionParams().images) {
                return new PublishProfileWebAppContainerDeploymentProvider_1.PublishProfileWebAppContainerDeploymentProvider(type);
            }
            else {
                return new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type);
            }
        }
        else if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN) {
            if (!!actionparameters_1.ActionParameters.getActionParams().images || (!!actionparameters_1.ActionParameters.getActionParams().isLinux && !!actionparameters_1.ActionParameters.getActionParams().multiContainerConfigFile)) {
                return new WebAppContainerDeployment_1.WebAppContainerDeploymentProvider(type);
            }
            else {
                return new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type);
            }
        }
        else {
            throw new Error("Invalid deployment provider type.");
        }
    }
}
exports.DeploymentProviderFactory = DeploymentProviderFactory;
