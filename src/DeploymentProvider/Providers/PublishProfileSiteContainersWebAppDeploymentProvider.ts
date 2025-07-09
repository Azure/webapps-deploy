import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { SiteContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility';

export class PublishProfileSiteContainersWebAppDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility(this.appService);
        let sidecarContainers = this.actionParams.sidecarConfig;
        await siteContainerDeploymentUtility.updateSiteContainers(sidecarContainers);
    }
}