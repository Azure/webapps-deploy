import { containerInputsNotAllowed, startupCommandNotAllowed, validateAppDetails, validatePackageInput } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class PublishProfileWebAppValidator implements IValidator {
    
    async validate(): Promise<void> {

        let actionParams: ActionParameters = ActionParameters.getActionParams();
        
        containerInputsNotAllowed(actionParams.images, actionParams.multiContainerConfigFile, true);

        validateAppDetails();

        startupCommandNotAllowed(actionParams.startupCommand);

        await validatePackageInput();
    }
    
}