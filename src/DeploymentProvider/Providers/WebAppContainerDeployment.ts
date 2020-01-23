import { BaseWebAppDeploymentProvider } from './BaseWebAppDeploymentProvider';
import { ContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility';

export class WebAppContainerDeploymentProvider extends BaseWebAppDeploymentProvider {
    
    public async DeployWebAppStep() {
        let containerDeploymentUtility: ContainerDeploymentUtility = new ContainerDeploymentUtility(this.appService);

        let images = this.actionParams.images;
        let configFile = this.actionParams.multiContainerConfigFile;
        let isLinux = this.actionParams.isLinux;
        let isMultiContainer = this.actionParams.isMultiContainer;
        let startupCommand = this.actionParams.startupCommand;
        
        await containerDeploymentUtility.deployWebAppImage(images, configFile, isLinux, isMultiContainer, startupCommand);
    }    
}