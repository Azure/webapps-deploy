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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorFactory = void 0;
const core = __importStar(require("@actions/core"));
const actionparameters_1 = require("../actionparameters");
const AzureResourceFilterUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility");
const BaseWebAppDeploymentProvider_1 = require("../DeploymentProvider/Providers/BaseWebAppDeploymentProvider");
const PublishProfileWebAppValidator_1 = require("./ActionValidators/PublishProfileWebAppValidator");
const PublishProfileContainerWebAppValidator_1 = require("./ActionValidators/PublishProfileContainerWebAppValidator");
const SpnLinuxContainerWebAppValidator_1 = require("./ActionValidators/SpnLinuxContainerWebAppValidator");
const SpnLinuxWebAppValidator_1 = require("./ActionValidators/SpnLinuxWebAppValidator");
const SpnWindowsContainerWebAppValidator_1 = require("./ActionValidators/SpnWindowsContainerWebAppValidator");
const SpnWindowsWebAppValidator_1 = require("./ActionValidators/SpnWindowsWebAppValidator");
const Validations_1 = require("./Validations");
const PublishProfile_1 = require("../Utilities/PublishProfile");
const RuntimeConstants_1 = __importDefault(require("../RuntimeConstants"));
const SpnWebAppSiteContainersValidator_1 = require("./ActionValidators/SpnWebAppSiteContainersValidator");
const PublishProfileWebAppSiteContainersValidator_1 = require("./ActionValidators/PublishProfileWebAppSiteContainersValidator");
const azure_app_service_1 = require("azure-actions-appservice-rest/Arm/azure-app-service");
class ValidatorFactory {
    static getValidator(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionParams = actionparameters_1.ActionParameters.getActionParams();
            if (type === BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
                if (!!actionParams.blessedAppSitecontainers || !!actionParams.siteContainers) {
                    return new PublishProfileWebAppSiteContainersValidator_1.PublishProfileWebAppSiteContainersValidator();
                }
                else if (!!actionParams.images) {
                    yield this.setResourceDetails(actionParams);
                    return new PublishProfileContainerWebAppValidator_1.PublishProfileContainerWebAppValidator();
                }
                else {
                    try {
                        yield this.setResourceDetails(actionParams);
                    }
                    catch (error) {
                        core.warning(`Failed to set resource details: ${error.message}`);
                    }
                    return new PublishProfileWebAppValidator_1.PublishProfileWebAppValidator();
                }
            }
            else if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN) {
                // app-name is required to get resource details
                (0, Validations_1.appNameIsRequired)(actionParams.appName);
                yield this.getResourceDetails(actionParams);
                if (!!actionParams.isLinux) {
                    if (!!actionParams.siteContainers) {
                        yield this.setBlessedSitecontainerApp(actionParams);
                        return new SpnWebAppSiteContainersValidator_1.SpnWebAppSiteContainersValidator();
                    }
                    else if (!!actionParams.images || !!actionParams.multiContainerConfigFile) {
                        return new SpnLinuxContainerWebAppValidator_1.SpnLinuxContainerWebAppValidator();
                    }
                    else {
                        return new SpnLinuxWebAppValidator_1.SpnLinuxWebAppValidator();
                    }
                }
                else {
                    if (!!actionParams.images) {
                        return new SpnWindowsContainerWebAppValidator_1.SpnWindowsContainerWebAppValidator();
                    }
                    else {
                        return new SpnWindowsWebAppValidator_1.SpnWindowsWebAppValidator();
                    }
                }
            }
            else {
                throw new Error("Valid credentials are not available. Add Azure Login action before this action or provide publish-profile input.");
            }
        });
    }
    static getResourceDetails(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let appDetails = yield AzureResourceFilterUtility_1.AzureResourceFilterUtility.getAppDetails(params.endpoint, params.appName, params.resourceGroupName, params.slotName);
            params.resourceGroupName = appDetails["resourceGroupName"];
            params.realKind = appDetails["kind"];
            params.kind = actionparameters_1.appKindMap.get(params.realKind);
            //app kind linux and kubeapp is supported only on linux environment currently
            params.isLinux = params.realKind.indexOf("linux") > -1 || params.realKind.indexOf("kubeapp") > -1;
        });
    }
    static setResourceDetails(actionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const publishProfile = PublishProfile_1.PublishProfile.getPublishProfile(actionParams.publishProfileContent);
            const appOS = yield publishProfile.getAppOS();
            actionParams.isLinux = appOS.includes(RuntimeConstants_1.default.Unix) || appOS.includes(RuntimeConstants_1.default.Unix.toLowerCase());
        });
    }
    static setBlessedSitecontainerApp(actionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const appService = new azure_app_service_1.AzureAppService(actionParams.endpoint, actionParams.resourceGroupName, actionParams.appName, actionParams.slotName);
            let config = yield appService.getConfiguration();
            core.debug(`LinuxFxVersion of app is: ${config.properties.linuxFxVersion}`);
            const linuxFxVersion = ((_a = config.properties.linuxFxVersion) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
            actionParams.blessedAppSitecontainers = (!linuxFxVersion.startsWith("DOCKER|")
                && !linuxFxVersion.startsWith("COMPOSE|")
                && linuxFxVersion !== "SITECONTAINERS");
            core.debug(`Is blessed app sitecontainers: ${actionParams.blessedAppSitecontainers}`);
        });
    }
}
exports.ValidatorFactory = ValidatorFactory;
