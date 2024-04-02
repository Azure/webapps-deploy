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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WebAppDeploymentProvider = void 0;
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
            const validTypes = ["war", "jar", "ear", "zip", "static"];
            // kudu warm up
            yield this.kuduServiceUtility.warmpUp();
            // If provided, type paramater takes precidence over file package type
            if (this.actionParams.type != null && validTypes.includes(this.actionParams.type.toLowerCase())) {
                core.debug("Initiated deployment via kudu service for webapp" + this.actionParams.type + "package : " + webPackage);
            }
            else {
                // Retains the old behavior of determining the package type from the file extension if valid type is not defined
                let packageType = appPackage.getPackageType();
                switch (packageType) {
                    case packageUtility_1.PackageType.war:
                        core.debug("Initiated deployment via kudu service for webapp war package : " + webPackage);
                        this.actionParams.type = "war";
                        break;
                    case packageUtility_1.PackageType.jar:
                        core.debug("Initiated deployment via kudu service for webapp jar package : " + webPackage);
                        this.actionParams.type = "jar";
                        break;
                    case packageUtility_1.PackageType.folder:
                        let tempPackagePath = utility.generateTemporaryFolderOrZipPath(`${process.env.RUNNER_TEMP}`, false);
                        webPackage = (yield zipUtility.archiveFolder(webPackage, "", tempPackagePath));
                        core.debug("Compressed folder into zip " + webPackage);
                        core.debug("Initiated deployment via kudu service for webapp package : " + webPackage);
                        this.actionParams.type = "zip";
                        break;
                    case packageUtility_1.PackageType.zip:
                        core.debug("Initiated deployment via kudu service for webapp zip package : " + webPackage);
                        this.actionParams.type = "zip";
                        break;
                    default:
                        throw new Error('Invalid App Service package: ' + webPackage + ' or type provided: ' + this.actionParams.type);
                }
            }
            this.deploymentID = yield this.kuduServiceUtility.deployUsingOneDeploy(webPackage, { slotName: this.actionParams.slotName, commitMessage: this.actionParams.commitMessage }, this.actionParams.targetPath, this.actionParams.type, this.actionParams.clean, this.actionParams.restart);
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
}
exports.WebAppDeploymentProvider = WebAppDeploymentProvider;
