"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentProviderFactory = void 0;
const core = __importStar(require("@actions/core"));
const actionparameters_1 = require("../actionparameters");
const BaseWebAppDeploymentProvider_1 = require("./Providers/BaseWebAppDeploymentProvider");
const WebAppContainerDeployment_1 = require("./Providers/WebAppContainerDeployment");
const WebAppDeploymentProvider_1 = require("./Providers/WebAppDeploymentProvider");
const PublishProfileWebAppContainerDeploymentProvider_1 = require("./Providers/PublishProfileWebAppContainerDeploymentProvider");
const WebAppSiteContainersDeploymentProvider_1 = require("./Providers/WebAppSiteContainersDeploymentProvider");
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
            if (!!actionparameters_1.ActionParameters.getActionParams().blessedAppSitecontainers || !!actionparameters_1.ActionParameters.getActionParams().siteContainers) {
                return new WebAppSiteContainersDeploymentProvider_1.WebAppSiteContainersDeploymentProvider(type);
            }
            else if (!!actionparameters_1.ActionParameters.getActionParams().images || (!!actionparameters_1.ActionParameters.getActionParams().isLinux && !!actionparameters_1.ActionParameters.getActionParams().multiContainerConfigFile)) {
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
