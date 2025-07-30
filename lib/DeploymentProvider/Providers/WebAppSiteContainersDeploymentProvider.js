"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const SiteContainerDeploymentUtility_1 = require("azure-actions-appservice-rest/Utilities/SiteContainerDeploymentUtility");
const core = __importStar(require("@actions/core"));
const WebAppDeploymentProvider_1 = require("./WebAppDeploymentProvider");
class WebAppSiteContainersDeploymentProvider extends WebAppDeploymentProvider_1.WebAppDeploymentProvider {
    DeployWebAppStep() {
        const _super = Object.create(null, {
            DeployWebAppStep: { get: () => super.DeployWebAppStep }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.actionParams.blessedAppSitecontainers) {
                core.info("Blessed site containers detected, using WebAppDeploymentProvider for deployment.");
                yield _super.DeployWebAppStep.call(this);
            }
            let siteContainerDeploymentUtility = new SiteContainerDeploymentUtility_1.SiteContainerDeploymentUtility(this.appService);
            let siteContainers = this.actionParams.siteContainers;
            core.info("Updating site containers");
            for (let i = 0; i < siteContainers.length; i++) {
                let siteContainer = siteContainers[i];
                core.info("updating site container: " + siteContainer.getName());
                yield siteContainerDeploymentUtility.updateSiteContainer(siteContainer);
            }
        });
    }
}
exports.WebAppSiteContainersDeploymentProvider = WebAppSiteContainersDeploymentProvider;
