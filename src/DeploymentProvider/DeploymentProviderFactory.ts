import * as core from '@actions/core';

import { ActionParameters, WebAppKind } from "../actionparameters";

import { DEPLOYMENT_PROVIDER_TYPES } from "./Providers/BaseWebAppDeploymentProvider";
import { IWebAppDeploymentProvider } from "./Providers/IWebAppDeploymentProvider";
import { WebAppContainerDeploymentProvider } from "./Providers/WebAppContainerDeployment";
import { WebAppDeploymentProvider } from "./Providers/WebAppDeploymentProvider";
import { PublishProfileWebAppContainerDeploymentProvider } from "./Providers/PublishProfileWebAppContainerDeploymentProvider";
import { WebAppSiteContainersDeploymentProvider } from "./Providers/WebAppSiteContainersDeploymentProvider";

export class DeploymentProviderFactory {

    public static getDeploymentProvider(type: DEPLOYMENT_PROVIDER_TYPES) : IWebAppDeploymentProvider[] {
        if(type === DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
            if (!!ActionParameters.getActionParams().images) {
                return [new PublishProfileWebAppContainerDeploymentProvider(type)];
            }
            else {
                return [new WebAppDeploymentProvider(type)];
            }
        }
        else if(type == DEPLOYMENT_PROVIDER_TYPES.SPN) {
            if (!!ActionParameters.getActionParams().blessedAppSitecontainers) {
                core.info("Using blessed app site containers deployment provider");
                return [new WebAppDeploymentProvider(type), new WebAppSiteContainersDeploymentProvider(type)];
            }
            else if (!!ActionParameters.getActionParams().siteContainers) {
                core.info("Using site containers deployment provider");
                return [new WebAppSiteContainersDeploymentProvider(type)];
            }
            else if(!!ActionParameters.getActionParams().images || (!!ActionParameters.getActionParams().isLinux && !!ActionParameters.getActionParams().multiContainerConfigFile)) {
                core.info("Using web app container deployment provider");
                return [new WebAppContainerDeploymentProvider(type)];
            }
            else {
                core.info("Using web app deployment provider");
                return [new WebAppDeploymentProvider(type)];
            }
        }
        else {
            throw new Error("Invalid deployment provider type.");
        }
    }
}