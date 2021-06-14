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
const packageUtility_1 = require("azure-actions-utility/packageUtility");
const BaseWebAppDeploymentProvider_1 = require("./BaseWebAppDeploymentProvider");
const AnnotationUtility_1 = require("azure-actions-appservice-rest/Utilities/AnnotationUtility");
class WebAppDeploymentProvider extends BaseWebAppDeploymentProvider_1.BaseWebAppDeploymentProvider {
    DeployWebAppStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let appPackage = this.actionParams.package;
            let webPackage = appPackage.getPath();
            // kudu warm up
            yield this.kuduServiceUtility.warmpUp();
            let packageType = appPackage.getPackageType();
            switch (packageType) {
                case packageUtility_1.PackageType.war:
                    core.debug("Initiated deployment via kudu service for webapp war package : " + webPackage);
                    var warName = utility.getFileNameFromPath(webPackage, ".war");
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingWarDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage: this.actionParams.commitMessage }, warName);
                    break;
                case packageUtility_1.PackageType.jar:
                    core.debug("Initiated deployment via kudu service for webapp jar package : " + webPackage);
                    let folderPath = yield utility.generateTemporaryFolderForDeployment(false, webPackage, packageUtility_1.PackageType.jar);
                    let output = yield utility.archiveFolderForDeployment(false, folderPath);
                    webPackage = output.webDeployPkg;
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage: this.actionParams.commitMessage });
                    break;
                case packageUtility_1.PackageType.folder:
                    let tempPackagePath = utility.generateTemporaryFolderOrZipPath(`${process.env.RUNNER_TEMP}`, false);
                    webPackage = (yield zipUtility.archiveFolder(webPackage, "", tempPackagePath));
                    core.debug("Compressed folder into zip " + webPackage);
                    core.debug("Initiated deployment via kudu service for webapp package : " + webPackage);
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage: this.actionParams.commitMessage });
                    break;
                case packageUtility_1.PackageType.zip:
                    core.debug("Initiated deployment via kudu service for webapp package : " + webPackage);
                    this.deploymentID = yield this.kuduServiceUtility.deployUsingZipDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage: this.actionParams.commitMessage });
                    break;
                default:
                    throw new Error('Invalid App Service package or folder path provided: ' + webPackage);
            }
            // updating startup command
            if (!!this.actionParams.startupCommand) {
                yield this.updateStartupCommand();
            }
        });
    }
    updateStartupCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentConfig = yield this.appService.getConfiguration();
            let currentStartupCommand = currentConfig.properties.appCommandLine;
            let newStartupCommand = this.actionParams.startupCommand;
            if (currentStartupCommand != newStartupCommand) {
                yield this.appServiceUtility.updateConfigurationSettings({ appCommandLine: newStartupCommand });
            }
            else {
                core.debug(`Skipped updating appCommandLine. Current value is: ${currentStartupCommand}`);
            }
        });
    }
    UpdateDeploymentStatus(isDeploymentSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.appService) {
                yield AnnotationUtility_1.addAnnotation(this.actionParams.endpoint, this.appService, isDeploymentSuccess);
            }
            console.log('App Service Application URL: ' + this.applicationURL);
            core.setOutput('webapp-url', this.applicationURL);
        });
    }
}
exports.WebAppDeploymentProvider = WebAppDeploymentProvider;
