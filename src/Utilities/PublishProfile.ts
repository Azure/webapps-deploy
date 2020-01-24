var core = require("@actions/core");

import { FormatType, SecretParser } from 'actions-secret-parser';

export interface ScmCredentials {
    uri: string;
    username: string;
    password: string;
}

export class PublishProfile {
    private _creds: ScmCredentials;
    private _appUrl: string;
    private static _publishProfile: PublishProfile;

    private constructor(publishProfileContent: string) {
        try {
            let secrets = new SecretParser(publishProfileContent, FormatType.XML);
            this._creds = {
                uri: secrets.getSecret("//publishProfile/@publishUrl", false),
                username: secrets.getSecret("//publishProfile/@userName", true),
                password: secrets.getSecret("//publishProfile/@userPWD", true)
            };
            this._appUrl = secrets.getSecret("//publishProfile/@destinationAppUrl", false);
            if(this._creds.uri.indexOf("scm") < 0) {
                throw new Error("Publish profile does not contain kudu URL");
            }
            this._creds.uri = `https://${this._creds.uri}`;
        } catch(error) {
            core.error("Failed to fetch credentials from Publish Profile. For more details on how to set publish profile credentials refer https://aka.ms/create-secrets-for-GitHub-workflows");
            throw error;
        }
    }

    public static getPublishProfile(publishProfileContent: string) {
        if(!this._publishProfile) {
            this._publishProfile = new PublishProfile(publishProfileContent);
        }
        return this._publishProfile;
    }

    public get creds(): ScmCredentials {
        return this._creds;
    }

    public get appUrl(): string {
        return this._appUrl;
    }
}