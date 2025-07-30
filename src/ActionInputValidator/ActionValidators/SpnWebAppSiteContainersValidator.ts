import * as core from '@actions/core';
import { validateSiteContainersInputs } from "../Validations";

import { IValidator } from "./IValidator";
import { SpnLinuxWebAppValidator } from "./SpnLinuxWebAppValidator";

export class SpnWebAppSiteContainersValidator extends SpnLinuxWebAppValidator {
    async validate(): Promise<void> {
        await super.validate();

        core.info("Validating SPN Web App Site Containers inputs...");
        validateSiteContainersInputs();
    }
}