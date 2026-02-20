import { ActionParameters } from "../../src/actionparameters";
import { AzureResourceFilterUtility } from "azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility";
import { ValidatorFactory } from '../../src/ActionInputValidator/ValidatorFactory';
import { DEPLOYMENT_PROVIDER_TYPES } from "../../src/DeploymentProvider/Providers/BaseWebAppDeploymentProvider";
import { PublishProfileContainerWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/PublishProfileContainerWebAppValidator";
import { PublishProfileWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/PublishProfileWebAppValidator";
import { SpnLinuxContainerWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/SpnLinuxContainerWebAppValidator";
import { SpnLinuxWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/SpnLinuxWebAppValidator";
import { SpnWindowsContainerWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/SpnWindowsContainerWebAppValidator";
import { SpnWindowsWebAppValidator } from "../../src/ActionInputValidator/ActionValidators/SpnWindowsWebAppValidator";
import { PublishProfile } from "../../src/Utilities/PublishProfile";

describe('Test Validator Factory', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Test webapps-deploy for publish-profile', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("Get Code Validator for Publish Profile auth flow", async() => {
            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
            
            jest.spyOn(PublishProfile, 'getPublishProfile').mockImplementation(() => PublishProfile.prototype);
            jest.spyOn(PublishProfile.prototype, 'getAppOS').mockImplementation(async() => 'unix');
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(PublishProfileWebAppValidator);
        });
    
        it("Get Container Validator for Publish Profile auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    images : 'MOCK_IMAGES'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
            
            jest.spyOn(PublishProfile, 'getPublishProfile').mockImplementation(() => PublishProfile.prototype);
            jest.spyOn(PublishProfile.prototype, 'getAppOS').mockImplementation(async() => 'unix');
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(PublishProfileContainerWebAppValidator);
        });
        
    });

    describe('Test webapps-deploy for SPN/RBAC', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("Get Linux/Kube Container Validator for SPN auth type", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    images : 'MOCK_IMAGES',
                    appName : 'MOCK_APP_NAME'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;

            jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
                return {
                    resourceGroupName:'MOCK_RESOURCE_NAME',
                    kind:'kubeapp,container'
                };
            });
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(SpnLinuxContainerWebAppValidator);
        });

        it("Get Linux/Kube Code Validator for SPN auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    appName : 'MOCK_APP_NAME'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;

            jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
                return {
                    resourceGroupName:'MOCK_RESOURCE_NAME',
                    kind:'kubeapp'
                };
            });
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(SpnLinuxWebAppValidator);
        });

        it("Get Windows Container Validator for SPN auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    images : 'MOCK_IMAGES',
                    appName : 'MOCK_APP_NAME'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;

            jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
                return {
                    resourceGroupName:'MOCK_RESOURCE_NAME',
                    kind:'app,container,windows'
                };
            });
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(SpnWindowsContainerWebAppValidator);
        });

        it("Get Windows Code Validator for SPN auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    appName : 'MOCK_APP_NAME'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;

            jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
                return {
                    resourceGroupName:'MOCK_RESOURCE_NAME',
                    kind:'app'
                };
            });
    
            let validator = await ValidatorFactory.getValidator(type);
            expect(validator).toBeInstanceOf(SpnWindowsWebAppValidator);
        });

    });
    
});