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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
const actions_secret_parser_1 = require("actions-secret-parser");
const azure_app_kudu_service_1 = require("azure-actions-appservice-rest/Kudu/azure-app-kudu-service");
const RuntimeConstants_1 = __importDefault(require("../RuntimeConstants"));
class PublishProfile {
    constructor(publishProfileContent) {
        try {
            let secrets = new actions_secret_parser_1.SecretParser(publishProfileContent, actions_secret_parser_1.FormatType.XML);
            this._creds = {
                uri: secrets.getSecret("//publishProfile/@publishUrl", false),
                username: secrets.getSecret("//publishProfile/@userName", true),
                password: secrets.getSecret("//publishProfile/@userPWD", true)
            };
            this._appUrl = secrets.getSecret("//publishProfile/@destinationAppUrl", false);
            if (this._creds.uri.indexOf("scm") < 0) {
                throw new Error("Publish profile does not contain kudu URL");
            }
            this._creds.uri = `https://${this._creds.uri}`;
            this._kuduService = new azure_app_kudu_service_1.Kudu(this._creds.uri, { username: this._creds.username, password: this._creds.password });
        }
        catch (error) {
            core.error("Failed to fetch credentials from Publish Profile. For more details on how to set publish profile credentials refer https://aka.ms/create-secrets-for-GitHub-workflows");
            throw error;
        }
    }
    static getPublishProfile(publishProfileContent) {
        if (!this._publishProfile) {
            this._publishProfile = new PublishProfile(publishProfileContent);
        }
        return this._publishProfile;
    }
    get creds() {
        return this._creds;
    }
    get appUrl() {
        return this._appUrl;
    }
    get kuduService() {
        return this._kuduService;
    }
    getAppOS() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._appOS) {
                    const appRuntimeDetails = yield this._kuduService.getAppRuntime();
                    this._appOS = appRuntimeDetails[RuntimeConstants_1.default.system][RuntimeConstants_1.default.osName];
                    core.debug(`App Runtime OS: ${this._appOS}`);
                }
            }
            catch (error) {
                throw Error("Failed to get app runtime OS\n" + JSON.stringify(error));
            }
            return this._appOS;
        });
    }
}
exports.PublishProfile = PublishProfile;
