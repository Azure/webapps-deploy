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
const actionparameters_1 = require("../actionparameters");
const AzureResourceFilterUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility");
const BaseWebAppDeploymentProvider_1 = require("../DeploymentProvider/Providers/BaseWebAppDeploymentProvider");
const PublishProfileWebAppValidator_1 = require("./ActionValidators/PublishProfileWebAppValidator");
const SpnLinuxContainerWebAppValidator_1 = require("./ActionValidators/SpnLinuxContainerWebAppValidator");
const SpnLinuxWebAppValidator_1 = require("./ActionValidators/SpnLinuxWebAppValidator");
const SpnWindowsContainerWebAppValidator_1 = require("./ActionValidators/SpnWindowsContainerWebAppValidator");
const SpnWindowsWebAppValidator_1 = require("./ActionValidators/SpnWindowsWebAppValidator");
const Validations_1 = require("./Validations");
class ValidatorFactory {
    static getValidator(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionParams = actionparameters_1.ActionParameters.getActionParams();
            if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE) {
                return new PublishProfileWebAppValidator_1.PublishProfileWebAppValidator();
            }
            else if (type == BaseWebAppDeploymentProvider_1.DEPLOYMENT_PROVIDER_TYPES.SPN) {
                // app-name is required to get resource details
                Validations_1.appNameIsRequired(actionParams.appName);
                yield this.getResourceDetails(actionParams);
                switch (actionParams.kind) {
                    case actionparameters_1.WebAppKind.Linux:
                        return new SpnLinuxWebAppValidator_1.SpnLinuxWebAppValidator();
                    case actionparameters_1.WebAppKind.Windows:
                        return new SpnWindowsWebAppValidator_1.SpnWindowsWebAppValidator();
                    case actionparameters_1.WebAppKind.LinuxContainer:
                        return new SpnLinuxContainerWebAppValidator_1.SpnLinuxContainerWebAppValidator();
                    case actionparameters_1.WebAppKind.WindowsContainer:
                        return new SpnWindowsContainerWebAppValidator_1.SpnWindowsContainerWebAppValidator();
                    default:
                        throw new Error(`Action does not support app service with kind ${actionParams.realKind}.`);
                }
            }
            else {
                throw new Error("Valid credentails are not available. Add Azure Login action before this action or provide publish-profile input.");
            }
        });
    }
    static getResourceDetails(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let appDetails = yield AzureResourceFilterUtility_1.AzureResourceFilterUtility.getAppDetails(params.endpoint, params.appName);
            params.resourceGroupName = appDetails["resourceGroupName"];
            params.realKind = appDetails["kind"];
            params.kind = actionparameters_1.appKindMap.get(params.realKind);
            params.isLinux = params.realKind.indexOf("linux") > -1;
        });
    }
}
exports.ValidatorFactory = ValidatorFactory;
