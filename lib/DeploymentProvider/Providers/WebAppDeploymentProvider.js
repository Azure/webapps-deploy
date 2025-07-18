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
exports.WebAppDeploymentProvider = void 0;
const core = __importStar(require("@actions/core"));
const utility = __importStar(require("azure-actions-utility/utility.js"));
const zipUtility = __importStar(require("azure-actions-utility/ziputility.js"));
const packageUtility_1 = require("azure-actions-utility/packageUtility");
const BaseWebAppDeploymentProvider_1 = require("./BaseWebAppDeploymentProvider");
const AnnotationUtility_1 = require("azure-actions-appservice-rest/Utilities/AnnotationUtility");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
                    // excluding release.zip while creating zip for deployment if it's a Linux PHP app
                    yield this.deleteReleaseZipForLinuxPhpApps(webPackage);
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
                yield (0, AnnotationUtility_1.addAnnotation)(this.actionParams.endpoint, this.appService, isDeploymentSuccess);
            }
            console.log('App Service Application URL: ' + this.applicationURL);
            core.setOutput('webapp-url', this.applicationURL);
        });
    }
    deleteReleaseZipForLinuxPhpApps(webPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseZipPath = path_1.default.join(webPackage, 'release.zip');
            // Ignore if the app is not a Linux app or if release.zip does not exist
            if (!this.actionParams.isLinux || !fs_1.default.existsSync(releaseZipPath)) {
                return;
            }
            let isPhpApp = yield this.checkIfTheAppIsPhpApp(webPackage);
            // No need to delete release.zip for non-PHP apps
            if (!isPhpApp) {
                return;
            }
            // Delete release.zip if it exists
            try {
                yield fs_1.default.promises.unlink(releaseZipPath);
                core.debug(`Deleted release.zip`);
            }
            catch (error) {
                core.debug(`Error while deleting release.zip for Linux PHP app: ${error}`);
            }
        });
    }
    checkIfTheAppIsPhpApp(webPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the webPackage folder contains a composer.json file
                const composerFile = 'composer.json';
                if (fs_1.default.existsSync(path_1.default.join(webPackage, composerFile))) {
                    return true;
                }
                // Check if the webPackage folder contains a .php file
                const hasPhpFiles = fs_1.default.readdirSync(webPackage).some(file => file.endsWith('.php'));
                return hasPhpFiles;
            }
            catch (error) {
                core.debug(`Error while checking if the app is PHP: ${error}`);
            }
            return false;
        });
    }
}
exports.WebAppDeploymentProvider = WebAppDeploymentProvider;
