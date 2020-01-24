import * as core from '@actions/core';

import { IAuthorizer } from "azure-actions-webclient/Authorizer/IAuthorizer";
import { Package } from 'azure-actions-utility/packageUtility';

export enum WebAppKind {
    Windows,
    Linux,
    WindowsContainer,
    LinuxContainer
};

export const appKindMap = new Map([
    [ 'app', WebAppKind.Windows ],
    [ 'app,linux', WebAppKind.Linux ],
    [ 'app,container,xenon', WebAppKind.WindowsContainer ],
    [ 'app,linux,container', WebAppKind.LinuxContainer ]
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

    private constructor(endpoint: IAuthorizer) {
        this._publishProfileContent = core.getInput('publish-profile');
        this._appName = core.getInput('app-name');
        this._slotName = core.getInput('slot-name');
        this._packageInput = core.getInput('package');
        this._images = core.getInput('images');
        this._multiContainerConfigFile = core.getInput('configuration-file');
        this._startupCommand = core.getInput('startup-command');
        this._endpoint = endpoint;    
    }

    public static getActionParams(endpoint?: IAuthorizer) {
        if(!this.actionparams) {
            this.actionparams = new ActionParameters(!!endpoint ? endpoint : null);
        }
        return this.actionparams;
    }

    public get appName() {
        return this._appName;
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
}