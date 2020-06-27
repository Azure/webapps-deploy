"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const main_1 = require("../main");
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const ValidatorFactory_1 = require("../ActionInputValidator/ValidatorFactory");
const DeploymentProviderFactory_1 = require("../DeploymentProvider/DeploymentProviderFactory");
const actionparameters_1 = require("../actionparameters");
const PublishProfileWebAppValidator_1 = require("../ActionInputValidator/ActionValidators/PublishProfileWebAppValidator");
const WebAppDeploymentProvider_1 = require("../DeploymentProvider/Providers/WebAppDeploymentProvider");
jest.mock('@actions/core');
jest.mock('../actionparameters');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('../ActionInputValidator/ActionValidators/PublishProfileWebAppValidator');
jest.mock('../DeploymentProvider/Providers/WebAppDeploymentProvider');
describe('Test azure-webapps-deploy', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("gets inputs and executes all the functions", () => __awaiter(void 0, void 0, void 0, function* () {
        let getAuthorizerSpy = jest.spyOn(AuthorizerFactory_1.AuthorizerFactory, 'getAuthorizer');
        let getActionParamsSpy = jest.spyOn(actionparameters_1.ActionParameters, 'getActionParams');
        let getInputSpy = jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
            switch (name) {
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
        let getValidatorFactorySpy = jest.spyOn(ValidatorFactory_1.ValidatorFactory, 'getValidator').mockImplementation((_type) => __awaiter(void 0, void 0, void 0, function* () { return new PublishProfileWebAppValidator_1.PublishProfileWebAppValidator(); }));
        let ValidatorFactoryValidateSpy = jest.spyOn(PublishProfileWebAppValidator_1.PublishProfileWebAppValidator.prototype, 'validate');
        let getDeploymentProviderSpy = jest.spyOn(DeploymentProviderFactory_1.DeploymentProviderFactory, 'getDeploymentProvider').mockImplementation(type => new WebAppDeploymentProvider_1.WebAppDeploymentProvider(type));
        let deployWebAppStepSpy = jest.spyOn(WebAppDeploymentProvider_1.WebAppDeploymentProvider.prototype, 'DeployWebAppStep');
        let updateDeploymentStatusSpy = jest.spyOn(WebAppDeploymentProvider_1.WebAppDeploymentProvider.prototype, 'UpdateDeploymentStatus');
        try {
            yield main_1.main();
        }
        catch (e) {
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
    }));
});
