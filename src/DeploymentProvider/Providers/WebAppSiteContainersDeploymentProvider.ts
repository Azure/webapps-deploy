import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { SiteContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility';
import * as core from '@actions/core';

export class WebAppSiteContainersDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility(this.appService);
        let siteContainers = this.actionParams.siteContainers;

        core.info("Updating site containers");

        for (let i = 0; i < siteContainers.length; i++) {
            let siteContainer = siteContainers[i];
            core.info("updating site container: " + siteContainer.getName());
            await siteContainerDeploymentUtility.updateSiteContainer(siteContainer);
        }
    }
}