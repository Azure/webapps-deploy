import { appNameIsRequired, containerInputsNotAllowed, startupCommandNotAllowed, validatePackageInput } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class SpnWindowsWebAppValidator implements IValidator {
    
    async validate(): Promise<void> {

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        containerInputsNotAllowed(actionParams.images, actionParams.multiContainerConfigFile);

        startupCommandNotAllowed(actionParams.startupCommand);

        await validatePackageInput();
    }
    
}