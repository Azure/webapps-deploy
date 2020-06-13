import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';

export class PublishProfileWebAppContainerDeploymentProvider extends BaseWebAppDeploymentProvider {
    public async DeployWebAppStep() {
        const appName: string = this.actionParams.appName;
        const images: string = this.actionParams.images;
        const isLinux: boolean = this.actionParams.isLinux;
        await this.kuduServiceUtility.deployWebAppImage(appName, images, isLinux);
    }
}