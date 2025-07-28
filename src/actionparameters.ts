import * as core from '@actions/core';
import { IAuthorizer } from "azure-actions-webclient/Authorizer/IAuthorizer";
import { Package } from 'azure-actions-utility/packageUtility';
import { SiteContainer } from 'azure-actions-appservice-rest/Arm/SiteContainer';
const github = require('@actions/github');

export enum WebAppKind {
    Windows,
    Linux,
    WindowsContainer,
    LinuxContainer
};

export const appKindMap = new Map([
    [ 'app', WebAppKind.Windows ],
    [ 'app,linux', WebAppKind.Linux ],
    [ 'app,container,windows', WebAppKind.WindowsContainer ],
    [ 'app,linux,container', WebAppKind.LinuxContainer ],
    [ 'api', WebAppKind.Windows ],
]);

export class ActionParameters {
    private static actionparams: ActionParameters;
    private _appName: string;
    private _packageInput: string;
    private _package: Package;
    private _images: string;
    private _resourceGroupName?: string;
    private _kind: WebAppKind;
    private _realKind: string;
    private _endpoint: IAuthorizer;
    private _publishProfileContent: string;
    private _slotName: string;
    private _multiContainerConfigFile?: string;
    private _startupCommand: string;
    private _isMultiContainer: boolean;
    private _isLinux: boolean;
    private _commitMessage: string;

    // Used only for OneDeploy
    private _type: string;
    private _targetPath: string;
    private _clean: string;
    private _restart: string;

    // Used for Sitecontainers app.
    private _siteContainers: SiteContainer[];
    private _blessedAppSitecontainers: boolean;

    private constructor(endpoint: IAuthorizer) {
        this._publishProfileContent = core.getInput('publish-profile');
        this._appName = core.getInput('app-name');
        this._slotName = core.getInput('slot-name');
        this._packageInput = core.getInput('package');
        this._images = core.getInput('images');
        this._multiContainerConfigFile = core.getInput('configuration-file');
        this._startupCommand = core.getInput('startup-command');
        this._resourceGroupName = core.getInput('resource-group-name');
        /**
         * Trimming the commit message because it is used as a param in uri of deployment api. And sometimes, it exceeds the max length of http URI.
         */
        this._commitMessage = github.context.eventName === 'push' ? github.context.payload.head_commit.message.slice(0, 1000) : "";
        this._endpoint = endpoint;

        // Used only for OneDeploy
        this._type = core.getInput('type');
        this._targetPath = core.getInput('target-path');
        this._clean = core.getInput('clean');
        this._restart = core.getInput('restart');

        // Used for Sitecontainers app.
        const siteContainersConfigInput = core.getInput('sitecontainers-config');
        if (siteContainersConfigInput) {
            const raw = JSON.parse(siteContainersConfigInput);
            this._siteContainers = raw.map(SiteContainer.fromJson);
        } else {
            this._siteContainers = null;
        }

        this._blessedAppSitecontainers = false;
    }

    public static getActionParams(endpoint?: IAuthorizer) {
        if (!this.actionparams) {
            this.actionparams = new ActionParameters(!!endpoint ? endpoint : null);
        }
        return this.actionparams;
    }
    public get appName() {
        return this._appName;
    }
    public get commitMessage(){
        return this._commitMessage;
    }
    public set commitMessage(commitMessage: string) {
        this._commitMessage = commitMessage;
    }
    public get packageInput() {
        return this._packageInput;
    }

    public get package() {
        return this._package;
    }

    public set package(appPackage: Package) {
        this._package = appPackage;
    }

    public get images() {
        return this._images;
    }

    public get resourceGroupName() {
        return this._resourceGroupName;
    }

    public set resourceGroupName(rg: string) {
        this._resourceGroupName = rg;
    }

    public get kind() {
        return this._kind;
    }

    public set kind(kind: WebAppKind) {
        this._kind = kind;
    }

    public get realKind() {
        return this._realKind;
    }

    public set realKind(kind: string) {
        this._realKind = kind;
    }

    public get endpoint() {
        return this._endpoint;
    }

    public get publishProfileContent() {
        return this._publishProfileContent;
    }

    public get slotName() {
        return this._slotName;
    }

    public get isMultiContainer() {
        return this._isMultiContainer;
    }

    public set isMultiContainer(isMultiCont: boolean) {
        this._isMultiContainer = isMultiCont;
    }

    public get isLinux(): boolean {
        return this._isLinux;
    }

    public set isLinux(isLin: boolean) {
        this._isLinux = isLin;
    }

    public get startupCommand() {
        return this._startupCommand;
    }

    public get multiContainerConfigFile() {
        return this._multiContainerConfigFile;
    }

    public get type() {
        return this._type;
    }

    public set type(type:string) {
        this._type = type;
    }

    public get targetPath() {
        return this._targetPath;
    }

    public get clean() {
        return this._clean;
    }

    public get restart() {
        return this._restart;
    }

    public get siteContainers(): SiteContainer[] {
        return this._siteContainers;
    }

    public set siteContainers(siteContainers: SiteContainer[]) {
        this._siteContainers = siteContainers;
    }

    public get blessedAppSitecontainers() {
        return this._blessedAppSitecontainers;
    }

    public set blessedAppSitecontainers(blessedAppSitecontainers: boolean) {
        this._blessedAppSitecontainers = blessedAppSitecontainers;
    }
}