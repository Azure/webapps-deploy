"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = require('@actions/github');
var WebAppKind;
(function (WebAppKind) {
    WebAppKind[WebAppKind["Windows"] = 0] = "Windows";
    WebAppKind[WebAppKind["Linux"] = 1] = "Linux";
    WebAppKind[WebAppKind["WindowsContainer"] = 2] = "WindowsContainer";
    WebAppKind[WebAppKind["LinuxContainer"] = 3] = "LinuxContainer";
})(WebAppKind = exports.WebAppKind || (exports.WebAppKind = {}));
;
exports.appKindMap = new Map([
    ['app', WebAppKind.Windows],
    ['app,linux', WebAppKind.Linux],
    ['app,container,windows', WebAppKind.WindowsContainer],
    ['app,linux,container', WebAppKind.LinuxContainer],
    ['api', WebAppKind.Windows],
]);
class ActionParameters {
    constructor(endpoint) {
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
    }
    static getActionParams(endpoint) {
        if (!this.actionparams) {
            this.actionparams = new ActionParameters(!!endpoint ? endpoint : null);
        }
        return this.actionparams;
    }
    get appName() {
        return this._appName;
    }
    get commitMessage() {
        return this._commitMessage;
    }
    set commitMessage(commitMessage) {
        this._commitMessage = commitMessage;
    }
    get packageInput() {
        return this._packageInput;
    }
    get package() {
        return this._package;
    }
    set package(appPackage) {
        this._package = appPackage;
    }
    get images() {
        return this._images;
    }
    get resourceGroupName() {
        return this._resourceGroupName;
    }
    set resourceGroupName(rg) {
        this._resourceGroupName = rg;
    }
    get kind() {
        return this._kind;
    }
    set kind(kind) {
        this._kind = kind;
    }
    get realKind() {
        return this._realKind;
    }
    set realKind(kind) {
        this._realKind = kind;
    }
    get endpoint() {
        return this._endpoint;
    }
    get publishProfileContent() {
        return this._publishProfileContent;
    }
    get slotName() {
        return this._slotName;
    }
    get isMultiContainer() {
        return this._isMultiContainer;
    }
    set isMultiContainer(isMultiCont) {
        this._isMultiContainer = isMultiCont;
    }
    get isLinux() {
        return this._isLinux;
    }
    set isLinux(isLin) {
        this._isLinux = isLin;
    }
    get startupCommand() {
        return this._startupCommand;
    }
    get multiContainerConfigFile() {
        return this._multiContainerConfigFile;
    }
}
exports.ActionParameters = ActionParameters;
