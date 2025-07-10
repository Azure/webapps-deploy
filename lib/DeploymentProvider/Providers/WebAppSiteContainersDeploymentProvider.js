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
exports.WebAppSiteContainersDeploymentProvider = void 0;
const BaseWebAppDeploymentProvider_1 = require("./BaseWebAppDeploymentProvider");
const SiteContainerDeploymentUtility_1 = require("azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility");
class WebAppSiteContainersDeploymentProvider extends BaseWebAppDeploymentProvider_1.BaseWebAppDeploymentProvider {
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility_1.SiteContainerDeploymentUtility(this.appService);
            let siteContainers = this.actionParams.siteContainers;
            for (let i = 0; i < siteContainers.length; i++) {
                let siteContainer = siteContainers[i];
                yield siteContainerDeploymentUtility.updateSiteContainer(siteContainer);
            }
        });
    }
}
exports.WebAppSiteContainersDeploymentProvider = WebAppSiteContainersDeploymentProvider;
