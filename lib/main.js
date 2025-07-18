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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core = __importStar(require("@actions/core"));
const crypto = __importStar(require("crypto"));
const actionparameters_1 = require("./actionparameters");
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const BaseWebAppDeploymentProvider_1 = require("./DeploymentProvider/Providers/BaseWebAppDeploymentProvider");
const DeploymentProviderFactory_1 = require("./DeploymentProvider/DeploymentProviderFactory");
const ValidatorFactory_1 = require("./ActionInputValidator/ValidatorFactory");
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let isDeploymentSuccess = true;
        try {
            // Set user agent variable
            let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
            let actionName = 'DeployWebAppToAzure';
            let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            // Initialize action inputs
            let endpoint = !!core.getInput('publish-profile') ? null : yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
            actionparameters_1.ActionParameters.getActionParams(endpoint);
            let type = null;
            if (!!endpoint) {
                type = BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN;
            }
            else {
                type = BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
            }
            // Validate action inputs
            let validator = yield ValidatorFactory_1.ValidatorFactory.getValidator(type);
            yield validator.validate();
            var deploymentProvider = DeploymentProviderFactory_1.DeploymentProviderFactory.getDeploymentProvider(type);
            core.debug("Predeployment Step Started");
            yield deploymentProvider.PreDeploymentStep();
            core.debug("Deployment Step Started");
            yield deploymentProvider.DeployWebAppStep();
        }
        catch (error) {
            isDeploymentSuccess = false;
            if (error.statusCode == 403) {
                core.setFailed("The deployment to your web app failed with HTTP status code 403. \
      Your web app may have networking features enabled which are blocking access (such as Private Endpoints). \
      For more information about deploying to virtual network integrated web apps, please follow https://aka.ms/gha/deploying-to-network-secured-sites");
            }
            else {
                core.setFailed("Deployment Failed, " + error);
            }
        }
        finally {
            if (deploymentProvider != null) {
                yield deploymentProvider.UpdateDeploymentStatus(isDeploymentSuccess);
            }
            // Reset AZURE_HTTP_USER_AGENT
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
            core.debug(isDeploymentSuccess ? "Deployment Succeeded" : "Deployment failed");
        }
    });
}
main();
