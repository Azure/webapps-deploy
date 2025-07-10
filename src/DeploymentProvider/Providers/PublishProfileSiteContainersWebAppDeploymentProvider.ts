import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { SiteContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility';

export class PublishProfileSiteContainersWebAppDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        //let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility(this.appService);
        let siteContainers = this.actionParams.siteContainers;

        console.log("siteContainerClient is", this.appServiceUtility);

        for (let i = 0; i < siteContainers.length; i++) {
            let siteContainer = siteContainers[i];
            await this.appServiceUtility.updateSiteContainer(siteContainer);
        }
    }
}