import * as core from '@actions/core';
import * as crypto from "crypto";

import { DEPLOYMENT_PROVIDER_TYPES, WebAppDeploymentProvider } from "./deploymentProvider/WebAppDeploymentProvider";

import { TaskParameters } from "./taskparameters";

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";

async function main() {
  let isDeploymentSuccess: boolean = true;  

  try {      
    // Set user agent variable
    let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
    let actionName = 'DeployWebAppToAzure';
    let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
    core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

    let taskParams: TaskParameters = TaskParameters.getTaskParams();
    let type = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;

    // get app kind
    if(!!taskParams.endpoint) {
      await taskParams.getResourceDetails();
      type = DEPLOYMENT_PROVIDER_TYPES.SPN;
    }
    var deploymentProvider = new WebAppDeploymentProvider(type);

    core.debug("Predeployment Step Started");
    await deploymentProvider.PreDeploymentStep();

    core.debug("Deployment Step Started");
    await deploymentProvider.DeployWebAppStep();
  }
  catch(error) {
    core.debug("Deployment Failed with Error: " + error);
    isDeploymentSuccess = false;
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