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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const PublishProfile_1 = require("../../Utilities/PublishProfile");
const actionparameters_1 = require("../../actionparameters");
const azure_app_service_1 = require("azure-actions-appservice-rest/Arm/azure-app-service");
const AzureAppServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureAppServiceUtility");
const KuduServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/KuduServiceUtility");
const AnnotationUtility_1 = require("azure-actions-appservice-rest/Utilities/AnnotationUtility");
class BaseWebAppDeploymentProvider {
    constructor(type) {
        this.authType = type;
        this.actionParams = actionparameters_1.ActionParameters.getActionParams();
    }
    PreDeploymentStep() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.authType) {
                case DEPLOYMENT_PROVIDER_TYPES.SPN:
                    yield this.initializeForSPN();
                    break;
                case DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE:
                    yield this.initializeForPublishProfile();
                    break;
                default:
                    throw new Error("Invalid deployment provider type");
            }
        });
    }
    UpdateDeploymentStatus(isDeploymentSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.appService) {
                yield AnnotationUtility_1.addAnnotation(this.actionParams.endpoint, this.appService, isDeploymentSuccess);
            }
            this.activeDeploymentID = yield this.kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, { 'type': 'Deployment', slotName: this.actionParams.slotName });
            core.debug('Active DeploymentId :' + this.activeDeploymentID);
            if (!!isDeploymentSuccess && !!this.deploymentID && !!this.activeDeploymentID) {
                yield this.kuduServiceUtility.postZipDeployOperation(this.deploymentID, this.activeDeploymentID);
            }
            console.log('App Service Application URL: ' + this.applicationURL);
            core.setOutput('webapp-url', this.applicationURL);
        });
    }
    initializeForSPN() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appService = new azure_app_service_1.AzureAppService(this.actionParams.endpoint, this.actionParams.resourceGroupName, this.actionParams.appName, this.actionParams.slotName);
            this.appServiceUtility = new AzureAppServiceUtility_1.AzureAppServiceUtility(this.appService);
            this.kuduService = yield this.appServiceUtility.getKuduService();
            this.kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(this.kuduService);
            this.applicationURL = yield this.appServiceUtility.getApplicationURL();
        });
    }
    initializeForPublishProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            const publishProfile = PublishProfile_1.PublishProfile.getPublishProfile(this.actionParams.publishProfileContent);
            this.kuduService = publishProfile.kuduService;
            this.kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(this.kuduService);
            this.applicationURL = publishProfile.appUrl;
        });
    }
}
exports.BaseWebAppDeploymentProvider = BaseWebAppDeploymentProvider;
var DEPLOYMENT_PROVIDER_TYPES;
(function (DEPLOYMENT_PROVIDER_TYPES) {
    DEPLOYMENT_PROVIDER_TYPES[DEPLOYMENT_PROVIDER_TYPES["SPN"] = 0] = "SPN";
    DEPLOYMENT_PROVIDER_TYPES[DEPLOYMENT_PROVIDER_TYPES["PUBLISHPROFILE"] = 1] = "PUBLISHPROFILE";
})(DEPLOYMENT_PROVIDER_TYPES = exports.DEPLOYMENT_PROVIDER_TYPES || (exports.DEPLOYMENT_PROVIDER_TYPES = {}));
