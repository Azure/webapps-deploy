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
    ['app,container,xenon', WebAppKind.WindowsContainer],
    ['app,linux,container', WebAppKind.LinuxContainer]
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
