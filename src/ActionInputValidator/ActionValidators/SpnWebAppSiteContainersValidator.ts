import { validateSiteContainersInputs } from "../Validations";
import { IValidator } from "./IValidator";

export class SpnWebAppSiteContainersValidator implements IValidator {
    async validate(): Promise<void> {
        
        validateSiteContainersInputs();
    
    }
}