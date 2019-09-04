import * as core from '@actions/core';

import { AzureResourceFilterUtility } from "pipelines-appservice-lib/lib/RestUtilities/AzureResourceFilterUtility";
import { IAuthorizationHandler } from "pipelines-appservice-lib/lib/ArmRest/IAuthorizationHandler";
import { Package } from 'pipelines-appservice-lib/lib/Utilities/packageUtility';
import { getHandler } from 'pipelines-appservice-lib/lib/AuthorizationHandlerFactory';

export class TaskParameters {
    private static taskparams: TaskParameters;
    private _appName: string;
    private _package: Package;
    private _resourceGroupName?: string;
    private _kind: string;
    private _endpoint: IAuthorizationHandler;
    private _publishProfileContent: string;
    private _slotName: string;

    private constructor() {
        this._publishProfileContent = core.getInput('publish-profile');
        this._package = new Package(core.getInput('package', { required: true }));
        if(!this._publishProfileContent) {
            this._endpoint = getHandler();
            this._appName = core.getInput('app-name', {required: true});
            this._slotName = core.getInput('slot-name');
        }
    }

    public static getTaskParams() {
        if(!this.taskparams) {
            this.taskparams = new TaskParameters();
        }
        return this.taskparams;
    }

    public get appName() {
        return this._appName;
    }

    public get package() {
        return this._package;
    }

    public get resourceGroupName() {
        return this._resourceGroupName;
    }

    public get kind() {
        return this._kind;
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

    public async getResourceDetails() {
        let appDetails = await AzureResourceFilterUtility.getAppDetails(this.endpoint, this.appName);
        this._resourceGroupName = appDetails["resourceGroupName"];
        this._kind = appDetails["kind"];
    }
}