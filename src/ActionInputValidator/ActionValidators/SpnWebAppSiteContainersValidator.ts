import * as core from '@actions/core';
import { validateSiteContainersInputs } from "../Validations";

import { IValidator } from "./IValidator";
import { SpnLinuxWebAppValidator } from "./SpnLinuxWebAppValidator";
import { ActionParameters } from '../../actionparameters';

export class SpnWebAppSiteContainersValidator extends SpnLinuxWebAppValidator {
    async validate(): Promise<void> {

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        if (!!actionParams.blessedAppSitecontainers) {
            core.info("Blessed site containers detected, using SpnLinuxWebAppValidator for validation.");
            await super.validate();
        }

        core.info("Validating SPN Web App Site Containers inputs...");
        validateSiteContainersInputs();
    }
}