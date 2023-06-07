import { appNameIsRequired, packageNotAllowed, validateContainerInputs } from "../Validations";

import { ActionParameters } from "../../actionparameters";
import { IValidator } from "./IValidator";

export class SpnLinuxContainerWebAppValidator implements IValidator {
    
    validate(): void {

        let actionParams: ActionParameters = ActionParameters.getActionParams();

        packageNotAllowed(actionParams.packageInput);
        console.log('Action params: ' + JSON.stringify(actionParams));
        console.log('Action params multiContainerConfigFile: ' + actionParams.multiContainerConfigFile);

        validateContainerInputs();
    }
    
}