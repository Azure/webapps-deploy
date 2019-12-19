"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const crypto = __importStar(require("crypto"));
const WebAppDeploymentProvider_1 = require("./deploymentProvider/WebAppDeploymentProvider");
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const taskparameters_1 = require("./taskparameters");
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
            let endpoint = !!core.getInput('publish-profile') ? null : yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
            let taskParams = taskparameters_1.TaskParameters.getTaskParams(endpoint);
            let type = WebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
            // get app kind
            if (!!taskParams.endpoint) {
                yield taskParams.getResourceDetails();
                type = WebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN;
            }
            var deploymentProvider = new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type);
            core.debug("Predeployment Step Started");
            yield deploymentProvider.PreDeploymentStep();
            core.debug("Deployment Step Started");
            yield deploymentProvider.DeployWebAppStep();
        }
        catch (error) {
            isDeploymentSuccess = false;
            core.error("Deployment Failed with Error: " + error);
            core.setFailed(error);
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
