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
exports.PublishProfileSiteContainersWebAppDeploymentProvider = void 0;
const BaseWebAppDeploymentProvider_1 = require("./BaseWebAppDeploymentProvider");
class PublishProfileSiteContainersWebAppDeploymentProvider extends BaseWebAppDeploymentProvider_1.BaseWebAppDeploymentProvider {
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            //let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility(this.appService);
            let siteContainers = this.actionParams.siteContainers;
            console.log("value of appservice:", this.appService);
            console.log("siteContainerClient is", this.appServiceUtility);
            for (let i = 0; i < siteContainers.length; i++) {
                let siteContainer = siteContainers[i];
                yield this.appServiceUtility.updateSiteContainer(siteContainer);
            }
        });
    }
}
exports.PublishProfileSiteContainersWebAppDeploymentProvider = PublishProfileSiteContainersWebAppDeploymentProvider;
