import * as core from '@actions/core';

import { Package, exist } from "azure-actions-utility/packageUtility";
import { PublishProfile, ScmCredentials } from "../Utilities/PublishProfile";
import RuntimeConstants from '../RuntimeConstants';
import { ActionParameters } from "../actionparameters";

import fs = require('fs');

// Error is app-name is not provided
export function appNameIsRequired(appname: string) {
    if(!appname) {
        throw new Error("app-name is a required input.");
    }
}

// Error if image info is provided
export function containerInputsNotAllowed(images: string, configFile: string, isPublishProfile: boolean = false) {
    if(!!images || !!configFile) {
        throw new Error(`This is not a container web app. Please remove inputs like images and configuration-file which are only relevant for container deployment.`);
    }
}

// Cross-validate provided app name and slot is same as that in publish profile
export function validateAppDetails() {

    let actionParams: ActionParameters = ActionParameters.getActionParams();

    if(!!actionParams.appName || (!!actionParams.slotName && actionParams.slotName.toLowerCase() !== 'production')) {
        let creds: ScmCredentials = PublishProfile.getPublishProfile(actionParams.publishProfileContent).creds;
        //for kubeapps in publishsettings file username doesn't start with $, for all other apps it starts with $
        let splitUsername: string[] = creds.username.startsWith("$") ? creds.username.toUpperCase().substring(1).split("__") : creds.username.toUpperCase().split("__");
        let appNameMatch: boolean = !actionParams.appName || actionParams.appName.toUpperCase() === splitUsername[0];
        let slotNameMatch: boolean = actionParams.slotName.toLowerCase() === 'production' || actionParams.slotName.toUpperCase() === splitUsername[1];
        if(!appNameMatch || !slotNameMatch) {
            throw new Error("Publish profile is invalid for app-name and slot-name provided. Provide correct publish profile credentials for app.");
        }
    }
}

// Error is startup command is provided
export function startupCommandNotAllowed(startupCommand: string) {
    if(!!startupCommand) {
        throw new Error("startup-command is not a valid input for Windows web app or with publish-profile auth scheme.");
    }
}

// Error if package input is provided
export function packageNotAllowed(apppackage: string) {
    if(!!apppackage && apppackage !== '.') {
        throw new Error("package is not a valid input for container web app.");
    }
}

// Error if multi container config file is provided
export function multiContainerNotAllowed(configFile: string) {
    if(!!configFile) {
        throw new Error("Multi container support is not available for windows containerized web app or with publish profile.");
    }
}

// Error if image name is not provided
export function validateSingleContainerInputs() {
    const actionParams: ActionParameters = ActionParameters.getActionParams();
    if(!actionParams.images) {
        throw new Error("Image name not provided for container. Provide a valid image name");
    }
}

// Validate container inputs
export function validateContainerInputs() {

    let actionParams: ActionParameters = ActionParameters.getActionParams();

    actionParams.isMultiContainer = false;

    if(!!actionParams.multiContainerConfigFile && exist(actionParams.multiContainerConfigFile)){
        let stats: fs.Stats = fs.statSync(actionParams.multiContainerConfigFile);
        if(!stats.isFile()) {
            throw new Error("Docker-compose file path is incorrect.");
        }
        else {
            actionParams.isMultiContainer = true;
            core.debug("Is multi-container app");
        }

        if(!!actionParams.images){
            console.log("Multi-container deployment with the transformation of Docker-Compose file.");
        }
        else {
            console.log("Multi-container deployment without transformation of Docker-Compose file.");
        }
    }
    else if(!actionParams.images) {
        throw new Error("For single-container, just specify a valid image name. For multi-container specifying a Docker-Compose file is mandatory and specifying image names is optional. Provide image names if the tags in Docker-Compose file need to be substituted.")
    }
    else if(actionParams.images.split("\n").length > 1) {
        throw new Error("Multiple images indicate multi-container deployment type, but Docker-compose file is absent.")
    }
}

// validate package input
export async function validatePackageInput() {
    let actionParams = ActionParameters.getActionParams();
    actionParams.package = new Package(actionParams.packageInput);

    // msbuild package deployment is not supported
    let isMSBuildPackage = await actionParams.package.isMSBuildPackage();
    if(isMSBuildPackage) {
        throw new Error(`Deployment of msBuild generated package is not supported. Please change package format.`);
    }
}