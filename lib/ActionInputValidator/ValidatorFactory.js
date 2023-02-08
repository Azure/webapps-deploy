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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
class ValidatorFactory {
    static getValidator(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionParams = actionparameters_1.ActionParameters.getActionParams();
            if (type === BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
                if (!!actionParams.images) {
                    yield this.setResourceDetails(actionParams);
                    return new PublishProfileContainerWebAppValidator_1.PublishProfileContainerWebAppValidator();
                }
                else {
                    return new PublishProfileWebAppValidator_1.PublishProfileWebAppValidator();
                }
            }
            else if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN) {
                // app-name is required to get resource details
                Validations_1.appNameIsRequired(actionParams.appName);
                yield this.getResourceDetails(actionParams);
                if (!!actionParams.isLinux) {
                    if (!!actionParams.images || !!actionParams.multiContainerConfigFile) {
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
            let appDetails = yield AzureResourceFilterUtility_1.AzureResourceFilterUtility.getAppDetails(params.endpoint, params.appName, params.resourceGroupName);
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
}
exports.ValidatorFactory = ValidatorFactory;
