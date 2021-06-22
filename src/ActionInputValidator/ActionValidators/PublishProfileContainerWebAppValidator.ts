import { packageNotAllowed, multiContainerNotAllowed, startupCommandNotAllowed, validateSingleContainerInputs, validateAppDetails } from "../Validations";
import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class PublishProfileContainerWebAppValidator implements IValidator {
    async validate(): Promise<void> {
        const actionParams: ActionParameters = ActionParameters.getActionParams();
        
        packageNotAllowed(actionParams.packageInput);

        multiContainerNotAllowed(actionParams.multiContainerConfigFile);
        
        startupCommandNotAllowed(actionParams.startupCommand);

        validateAppDetails();

        validateSingleContainerInputs();
    }

}