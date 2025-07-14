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
exports.appNameIsRequired = appNameIsRequired;
exports.containerInputsNotAllowed = containerInputsNotAllowed;
exports.validateAppDetails = validateAppDetails;
exports.startupCommandNotAllowed = startupCommandNotAllowed;
exports.packageNotAllowed = packageNotAllowed;
exports.multiContainerNotAllowed = multiContainerNotAllowed;
exports.validateSingleContainerInputs = validateSingleContainerInputs;
exports.validateContainerInputs = validateContainerInputs;
exports.validatePackageInput = validatePackageInput;
exports.siteContainersConfigNotAllowed = siteContainersConfigNotAllowed;
exports.validateSiteContainersInputs = validateSiteContainersInputs;
const core = __importStar(require("@actions/core"));
const packageUtility_1 = require("azure-actions-utility/packageUtility");
const PublishProfile_1 = require("../Utilities/PublishProfile");
const actionparameters_1 = require("../actionparameters");
const fs = require("fs");
// Error is app-name is not provided
function appNameIsRequired(appname) {
    if (!appname) {
        throw new Error("app-name is a required input.");
    }
}
// Error if image info is provided
function containerInputsNotAllowed(images, configFile, isPublishProfile = false) {
    if (!!images || !!configFile) {
        throw new Error(`This is not a container web app. Please remove inputs like images and configuration-file which are only relevant for container deployment.`);
    }
}
// Cross-validate provided app name and slot is same as that in publish profile
function validateAppDetails() {
    let actionParams = actionparameters_1.ActionParameters.getActionParams();
    if (!!actionParams.appName || (!!actionParams.slotName && actionParams.slotName.toLowerCase() !== 'production')) {
        let creds = PublishProfile_1.PublishProfile.getPublishProfile(actionParams.publishProfileContent).creds;
        //for kubeapps in publishsettings file username doesn't start with $, for all other apps it starts with $
        let splitUsername = creds.username.startsWith("$") ? creds.username.toUpperCase().substring(1).split("__") : creds.username.toUpperCase().split("__");
        let appNameMatch = !actionParams.appName || actionParams.appName.toUpperCase() === splitUsername[0];
        let slotNameMatch = actionParams.slotName.toLowerCase() === 'production' || actionParams.slotName.toUpperCase() === splitUsername[1];
        if (!appNameMatch || !slotNameMatch) {
            throw new Error("Publish profile is invalid for app-name and slot-name provided. Provide correct publish profile credentials for app.");
        }
    }
}
// Error is startup command is provided
function startupCommandNotAllowed(startupCommand) {
    if (!!startupCommand) {
        throw new Error("startup-command is not a valid input for Windows web app or with publish-profile auth scheme.");
    }
}
// Error if package input is provided
function packageNotAllowed(apppackage) {
    if (!!apppackage && apppackage !== '.') {
        throw new Error("package is not a valid input for container web app.");
    }
}
// Error if multi container config file is provided
function multiContainerNotAllowed(configFile) {
    if (!!configFile) {
        throw new Error("Multi container support is not available for windows containerized web app or with publish profile.");
    }
}
// Error if image name is not provided
function validateSingleContainerInputs() {
    const actionParams = actionparameters_1.ActionParameters.getActionParams();
    if (!actionParams.images) {
        throw new Error("Image name not provided for container. Provide a valid image name");
    }
}
// Validate container inputs
function validateContainerInputs() {
    let actionParams = actionparameters_1.ActionParameters.getActionParams();
    actionParams.isMultiContainer = false;
    if (!!actionParams.multiContainerConfigFile && (0, packageUtility_1.exist)(actionParams.multiContainerConfigFile)) {
        let stats = fs.statSync(actionParams.multiContainerConfigFile);
        if (!stats.isFile()) {
            throw new Error("Docker-compose file path is incorrect.");
        }
        else {
            actionParams.isMultiContainer = true;
            core.debug("Is multi-container app");
        }
        if (!!actionParams.images) {
            console.log("Multi-container deployment with the transformation of Docker-Compose file.");
        }
        else {
            console.log("Multi-container deployment without transformation of Docker-Compose file.");
        }
    }
    else if (!actionParams.images) {
        throw new Error("For single-container, just specify a valid image name. For multi-container specifying a Docker-Compose file is mandatory and specifying image names is optional. Provide image names if the tags in Docker-Compose file need to be substituted.");
    }
    else if (actionParams.images.split("\n").length > 1) {
        throw new Error("Multiple images indicate multi-container deployment type, but Docker-compose file is absent.");
    }
}
// validate package input
function validatePackageInput() {
    return __awaiter(this, void 0, void 0, function* () {
        let actionParams = actionparameters_1.ActionParameters.getActionParams();
        actionParams.package = new packageUtility_1.Package(actionParams.packageInput);
        // msbuild package deployment is not supported
        let isMSBuildPackage = yield actionParams.package.isMSBuildPackage();
        if (isMSBuildPackage) {
            throw new Error(`Deployment of msBuild generated package is not supported. Please change package format.`);
        }
    });
}
// Error if Sitecontainers configuration is provided
function siteContainersConfigNotAllowed(siteContainers) {
    if (!!siteContainers) {
        throw new Error("SiteContainers not valid input for this web app.");
    }
}
// validate Sitecontainers inputs
function validateSiteContainersInputs() {
    const actionParams = actionparameters_1.ActionParameters.getActionParams();
    if (!actionParams.siteContainers || actionParams.siteContainers.length === 0) {
        throw new Error("Site containers not provided.");
    }
}
