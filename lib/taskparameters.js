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
const AzureResourceFilterUtility_1 = require("pipelines-appservice-lib/lib/RestUtilities/AzureResourceFilterUtility");
const packageUtility_1 = require("pipelines-appservice-lib/lib/Utilities/packageUtility");
const AuthorizationHandlerFactory_1 = require("pipelines-appservice-lib/lib/AuthorizationHandlerFactory");
class TaskParameters {
    constructor() {
        this._publishProfileContent = core.getInput('publish-profile');
        this._package = new packageUtility_1.Package(core.getInput('package', { required: true }));
        if (!this._publishProfileContent) {
            this._endpoint = AuthorizationHandlerFactory_1.getHandler();
            this._appName = core.getInput('app-name', { required: true });
            this._slotName = core.getInput('slot-name');
        }
    }
    static getTaskParams() {
        if (!this.taskparams) {
            this.taskparams = new TaskParameters();
        }
        return this.taskparams;
    }
    get appName() {
        return this._appName;
    }
    get package() {
        return this._package;
    }
    get resourceGroupName() {
        return this._resourceGroupName;
    }
    get kind() {
        return this._kind;
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
    getResourceDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            let appDetails = yield AzureResourceFilterUtility_1.AzureResourceFilterUtility.getAppDetails(this.endpoint, this.appName);
            this._resourceGroupName = appDetails["resourceGroupName"];
            this._kind = appDetails["kind"];
        });
    }
}
exports.TaskParameters = TaskParameters;
