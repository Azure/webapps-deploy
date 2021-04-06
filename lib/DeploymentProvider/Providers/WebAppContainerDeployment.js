"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseWebAppDeploymentProvider_1 = require("./BaseWebAppDeploymentProvider");
const ContainerDeploymentUtility_1 = require("azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility");
class WebAppContainerDeploymentProvider extends BaseWebAppDeploymentProvider_1.BaseWebAppDeploymentProvider {
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let containerDeploymentUtility = new ContainerDeploymentUtility_1.ContainerDeploymentUtility(this.appService);
            let images = this.actionParams.images;
            let configFile = this.actionParams.multiContainerConfigFile;
            let isLinux = this.actionParams.isLinux;
            let isMultiContainer = this.actionParams.isMultiContainer;
            let startupCommand = this.actionParams.startupCommand;
            yield containerDeploymentUtility.deployWebAppImage(images, configFile, isLinux, isMultiContainer, startupCommand);
        });
    }
}
exports.WebAppContainerDeploymentProvider = WebAppContainerDeploymentProvider;
