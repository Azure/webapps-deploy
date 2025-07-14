import { IValidator } from "./IValidator";

export class PublishProfileWebAppSiteContainersValidator implements IValidator {
    async validate(): Promise<void> {
        throw new Error("publish-profile is not supported for Site Containers scenario");
    }
}