import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { SiteContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility';

export class WebAppSiteContainersDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility(this.appService);
        let siteContainers = this.actionParams.siteContainers;

        for (let i = 0; i < siteContainers.length; i++) {
            let siteContainer = siteContainers[i];
            await siteContainerDeploymentUtility.updateSiteContainer(siteContainer);
        }
    }
}