import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';

export class PublishProfileWebAppContainerDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        const appName: string = this.actionParams.appName;
        const images: string = this.actionParams.images;
        // TODO - how to check if its a linux container
        const isLinux = true;
        await this.kuduServiceUtility.deployWebAppImage(appName, images, isLinux);
    }
}