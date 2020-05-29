import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';

export class WebAppContainerDeploymentProvider extends BaseWebAppDeploymentProvider {
    
    public async DeployWebAppStep() {
        let appName: string = this.actionParams.appName;
        let images: string = this.actionParams.images;
        // TODO - how to check if its a linux container
        let isLinux = true;
        await this.kuduServiceUtility.deployWebAppImage(appName, images, isLinux);
    }    
}