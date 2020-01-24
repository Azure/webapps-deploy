import * as core from '@actions/core';
import * as crypto from "crypto";

import { ActionParameters, WebAppKind, appKindMap } from "./actionparameters";

import { AuthorizerFactory } from "azure-actions-webclient/AuthorizerFactory";
import { DEPLOYMENT_PROVIDER_TYPES } from "./DeploymentProvider/Providers/BaseWebAppDeploymentProvider";
import { DeploymentProviderFactory } from './DeploymentProvider/DeploymentProviderFactory';
import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { ValidatorFactory } from './ActionInputValidator/ValidatorFactory';

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";

async function main() {
  let isDeploymentSuccess: boolean = true;  

  try {      
    // Set user agent variable
    let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
    let actionName = 'DeployWebAppToAzure';
    let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
    core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

    // Initialize action inputs
    let endpoint: IAuthorizer = !!core.getInput('publish-profile') ? null : await AuthorizerFactory.getAuthorizer();
    let actionParams: ActionParameters = ActionParameters.getActionParams(endpoint);
    let type: DEPLOYMENT_PROVIDER_TYPES = null;

    if(!!endpoint) {
      type = DEPLOYMENT_PROVIDER_TYPES.SPN;
    }
    else {
      type = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
    }

    // Validate action inputs
    let validator = await ValidatorFactory.getValidator(type);
    await validator.validate();

    var deploymentProvider = DeploymentProviderFactory.getDeploymentProvider(type);

    core.debug("Predeployment Step Started");
    await deploymentProvider.PreDeploymentStep();

    core.debug("Deployment Step Started");
    await deploymentProvider.DeployWebAppStep();
  }
  catch(error) {
    isDeploymentSuccess = false;
    core.error("Deployment Failed with Error: " + error);
    core.setFailed(error);
  }
  finally {
      if(deploymentProvider != null) {
          await deploymentProvider.UpdateDeploymentStatus(isDeploymentSuccess);
      }
      
      // Reset AZURE_HTTP_USER_AGENT
      core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
      core.debug(isDeploymentSuccess ? "Deployment Succeeded" : "Deployment failed");
  }
}

main();