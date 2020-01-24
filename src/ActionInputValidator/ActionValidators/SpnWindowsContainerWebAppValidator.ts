import { appNameIsRequired, multiContainerNotAllowed, packageNotAllowed, startupCommandNotAllowed, validateContainerInputs } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class SpnWindowsContainerWebAppValidator implements IValidator {
    
    validate(): void {

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        packageNotAllowed(actionParams.packageInput);

        startupCommandNotAllowed(actionParams.startupCommand);

        multiContainerNotAllowed(actionParams.multiContainerConfigFile);
        
        validateContainerInputs();
    }
    
}