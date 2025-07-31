import { validateSiteContainersInputs } from "../Validations";
import { SpnLinuxWebAppValidator } from "./SpnLinuxWebAppValidator";
import { ActionParameters } from "../../actionparameters";

export class SpnWebAppSiteContainersValidator extends SpnLinuxWebAppValidator {
    async validate(): Promise<void> {

        let actionParams: ActionParameters = ActionParameters.getActionParams();
        if (!!actionParams.blessedAppSitecontainers) {
            await super.validate();
        }
        
        validateSiteContainersInputs();
    }
}