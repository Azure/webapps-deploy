import { validateSiteContainersInputs } from "../Validations";

import { IValidator } from "./IValidator";
import { SpnLinuxWebAppValidator } from "./SpnLinuxWebAppValidator";

export class SpnWebAppSiteContainersValidator extends SpnLinuxWebAppValidator {
    async validate(): Promise<void> {
        await super.validate();
        validateSiteContainersInputs();
    }
}