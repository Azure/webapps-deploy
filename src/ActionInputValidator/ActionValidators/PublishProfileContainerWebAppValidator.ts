import { packageNotAllowed, multiContainerNotAllowed, startupCommandNotAllowed, validateSingleContainerInputs } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class PublishProfileContainerWebAppValidator implements IValidator {
    
    async validate(): Promise<void> {

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        packageNotAllowed(actionParams.packageInput);

        // TODO: windows not allowed 

        multiContainerNotAllowed(actionParams.multiContainerConfigFile);
        
        startupCommandNotAllowed(actionParams.startupCommand);

        validateSingleContainerInputs();

    }
    
}