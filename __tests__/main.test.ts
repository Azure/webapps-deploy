import * as core from "@actions/core";
import {main} from "../src/main";
import { AuthorizerFactory } from "azure-actions-webclient/AuthorizerFactory";
import { ValidatorFactory } from '../src/ActionInputValidator/ValidatorFactory';
import { DeploymentProviderFactory } from '../src/DeploymentProvider/DeploymentProviderFactory';
import { ActionParameters} from "../src/actionparameters";
import { PublishProfileWebAppValidator } from '../src/ActionInputValidator/ActionValidators/PublishProfileWebAppValidator';
import { WebAppDeploymentProvider } from '../src/DeploymentProvider/Providers/WebAppDeploymentProvider';

jest.mock('@actions/core');
jest.mock('../src/actionparameters');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('../src/ActionInputValidator/ActionValidators/PublishProfileWebAppValidator');
jest.mock('../src/DeploymentProvider/Providers/WebAppDeploymentProvider');

describe('Test azure-webapps-deploy', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    })
        
    it("gets inputs and executes all the functions", async () => {
        
        let getAuthorizerSpy = jest.spyOn(AuthorizerFactory, 'getAuthorizer');
        let getActionParamsSpy = jest.spyOn(ActionParameters, 'getActionParams');
        let getInputSpy = jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
            switch(name) {
                case 'publish-profile': return 'MOCK_PUBLISH_PROFILE';
                case 'app-name': return 'MOCK_APP_NAME';
                case 'slot-name': return 'MOCK_SLOT_NAME';
                case 'package': return 'MOCK_PACKAGE';
                case 'images': return 'MOCK_IMAGES';
                case 'configuration-file': return 'MOCK_CONFIGFILE';
                case 'startup-command': return 'MOCK_STARTUP_COMMAND';
        }
            return '';
        });
        let getValidatorFactorySpy = jest.spyOn(ValidatorFactory, 'getValidator').mockImplementation(async _type => new PublishProfileWebAppValidator());
        let ValidatorFactoryValidateSpy = jest.spyOn(PublishProfileWebAppValidator.prototype, 'validate');
        let getDeploymentProviderSpy = jest.spyOn(DeploymentProviderFactory, 'getDeploymentProvider').mockImplementation(type => new WebAppDeploymentProvider(type));
        let deployWebAppStepSpy = jest.spyOn(WebAppDeploymentProvider.prototype, 'DeployWebAppStep');
        let updateDeploymentStatusSpy = jest.spyOn(WebAppDeploymentProvider.prototype, 'UpdateDeploymentStatus');

        try {
            await main();
        }
        catch(e) {
            console.log(e);
        }

        expect(getAuthorizerSpy).not.toHaveBeenCalled(); // When publish profile is given as input getAuthorizer is not called
        expect(getActionParamsSpy).toHaveBeenCalledTimes(1);
        expect(getInputSpy).toHaveBeenCalledTimes(1);
        expect(getValidatorFactorySpy).toHaveBeenCalledTimes(1);
        expect(ValidatorFactoryValidateSpy).toHaveBeenCalledTimes(1);
        expect(getDeploymentProviderSpy).toHaveBeenCalledTimes(1);
        expect(deployWebAppStepSpy).toHaveBeenCalled();
        expect(updateDeploymentStatusSpy).toHaveBeenCalled();
    });
});