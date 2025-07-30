import * as core from '@actions/core';
import { appNameIsRequired, containerInputsNotAllowed, validatePackageInput } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class SpnLinuxWebAppValidator implements IValidator {
    
    async validate(): Promise<void> {

        core.info("Validating SPN Linux Web App inputs...");

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        containerInputsNotAllowed(actionParams.images, actionParams.multiContainerConfigFile);

        await validatePackageInput();
    }
    
}