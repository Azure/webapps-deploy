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
const utility = __importStar(require("azure-actions-utility/utility.js"));
const zipUtility = __importStar(require("azure-actions-utility/ziputility.js"));
const azure_app_service_1 = require("azure-actions-appservice-rest/Arm/azure-app-service");
const AzureAppServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureAppServiceUtility");
const azure_app_kudu_service_1 = require("azure-actions-appservice-rest/Kudu/azure-app-kudu-service");
const KuduServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/KuduServiceUtility");
const packageUtility_1 = require("azure-actions-utility/packageUtility");
const taskparameters_1 = require("../taskparameters");
const AnnotationUtility_1 = require("azure-actions-appservice-rest/Utilities/AnnotationUtility");
var parseString = require('xml2js').parseString;
class WebAppDeploymentProvider {
    constructor(type) {
        this.authType = type;
        this.taskParams = taskparameters_1.TaskParameters.getTaskParams();
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
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let webPackage = taskparameters_1.TaskParameters.getTaskParams().package.getPath();
            let _isMSBuildPackage = yield taskparameters_1.TaskParameters.getTaskParams().package.isMSBuildPackage();
            if (_isMSBuildPackage) {
                throw new Error('MsBuildPackageNotSupported' + webPackage);
            }
            let packageType = taskparameters_1.TaskParameters.getTaskParams().package.getPackageType();
            // kudu warm up
            yield this.kuduServiceUtility.warmpUp();
            switch (packageType) {
                case packageUtility_1.PackageType.war:
                    core.debug("Initiated deployment via kudu service for webapp war package : " + webPackage);
                    var warName = utility.getFileNameFromPath(webPackage, ".war");
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingWarDeploy(webPackage, { slotName: this.taskParams.slotName }, warName);
                    break;
                case packageUtility_1.PackageType.jar:
                    core.debug("Initiated deployment via kudu service for webapp jar package : " + webPackage);
                    let folderPath = yield utility.generateTemporaryFolderForDeployment(false, webPackage, packageUtility_1.PackageType.jar);
                    let output = yield utility.archiveFolderForDeployment(false, folderPath);
                    webPackage = output.webDeployPkg;
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                    break;
                case packageUtility_1.PackageType.folder:
                    let tempPackagePath = utility.generateTemporaryFolderOrZipPath(`${process.env.RUNNER_TEMP}`, false);
                    webPackage = (yield zipUtility.archiveFolder(webPackage, "", tempPackagePath));
                    core.debug("Compressed folder into zip " + webPackage);
                case packageUtility_1.PackageType.zip:
                    core.debug("Initiated deployment via kudu service for webapp package : " + webPackage);
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage);
                    break;
                default:
                    throw new Error('Invalid App Service package or folder path provided: ' + webPackage);
            }
        });
    }
    UpdateDeploymentStatus(isDeploymentSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.appService) {
                yield AnnotationUtility_1.addAnnotation(this.taskParams.endpoint, this.appService, isDeploymentSuccess);
            }
            this.activeDeploymentID = yield this.kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, { 'type': 'Deployment', slotName: this.taskParams.slotName });
            core.debug('Active DeploymentId :' + this.activeDeploymentID);
            if (!!isDeploymentSuccess) {
                yield this.kuduServiceUtility.postZipDeployOperation(this.deploymentID, this.activeDeploymentID);
            }
            console.log('App Service Application URL: ' + this.applicationURL);
            core.setOutput('webapp-url', this.applicationURL);
        });
    }
    initializeForSPN() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appService = new azure_app_service_1.AzureAppService(this.taskParams.endpoint, this.taskParams.resourceGroupName, this.taskParams.appName, this.taskParams.slotName);
            this.appServiceUtility = new AzureAppServiceUtility_1.AzureAppServiceUtility(this.appService);
            this.kuduService = yield this.appServiceUtility.getKuduService();
            this.kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(this.kuduService);
            // setting application url
            this.applicationURL = yield this.appServiceUtility.getApplicationURL();
        });
    }
    initializeForPublishProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            let scmCreds;
            try {
                scmCreds = yield this.getCredsFromXml(taskparameters_1.TaskParameters.getTaskParams().publishProfileContent);
            }
            catch (error) {
                core.error("Failed to fetch credentials from Publish Profile. For more details on how to set publish profile credentials refer https://aka.ms/create-secrets-for-GitHub-workflows");
                throw error;
            }
            this.kuduService = new azure_app_kudu_service_1.Kudu(scmCreds.uri, scmCreds.username, scmCreds.password);
            this.kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(this.kuduService);
        });
    }
    getCredsFromXml(pubxmlFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let res;
            yield parseString(pubxmlFile, (error, result) => {
                if (!!error) {
                    throw new Error("Failed XML parsing " + error);
                }
                res = result.publishData.publishProfile[0].$;
            });
            let creds = {
                uri: res.publishUrl.split(":")[0],
                username: res.userName,
                password: res.userPWD
            };
            // masking kudu password
            core.setSecret('${creds.password}');
            if (creds.uri.indexOf("scm") < 0) {
                throw new Error("Publish profile does not contain kudu URL");
            }
            creds.uri = `https://${creds.uri}`;
            // setting application url
            this.applicationURL = res.destinationAppUrl;
            return creds;
        });
    }
}
exports.WebAppDeploymentProvider = WebAppDeploymentProvider;
var DEPLOYMENT_PROVIDER_TYPES;
(function (DEPLOYMENT_PROVIDER_TYPES) {
    DEPLOYMENT_PROVIDER_TYPES[DEPLOYMENT_PROVIDER_TYPES["SPN"] = 0] = "SPN";
    DEPLOYMENT_PROVIDER_TYPES[DEPLOYMENT_PROVIDER_TYPES["PUBLISHPROFILE"] = 1] = "PUBLISHPROFILE";
})(DEPLOYMENT_PROVIDER_TYPES = exports.DEPLOYMENT_PROVIDER_TYPES || (exports.DEPLOYMENT_PROVIDER_TYPES = {}));
