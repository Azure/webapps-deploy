import { ActionParameters } from "../../src/actionparameters";
import { DeploymentProviderFactory } from '../../src/DeploymentProvider/DeploymentProviderFactory';
import { DEPLOYMENT_PROVIDER_TYPES } from "../../src/DeploymentProvider/Providers/BaseWebAppDeploymentProvider";
import { WebAppContainerDeploymentProvider } from "../../src/DeploymentProvider/Providers/WebAppContainerDeployment";
import { WebAppDeploymentProvider } from "../../src/DeploymentProvider/Providers/WebAppDeploymentProvider";
import { PublishProfileWebAppContainerDeploymentProvider } from "../../src/DeploymentProvider/Providers/PublishProfileWebAppContainerDeploymentProvider";


describe('Test Deployment Provider Factory', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Test Deployment Provider for publish-profile', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("Get Code Deployment Provider for Publish Profile auth flow", async() => {
            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
    
            let provider = await DeploymentProviderFactory.getDeploymentProvider(type);
            expect(provider).toBeInstanceOf(WebAppDeploymentProvider);
        });
    
        it("Get Container Deployment Provider for Publish Profile auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    images : 'MOCK_IMAGES'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.PUBLISHPROFILE;
            
            let provider = await DeploymentProviderFactory.getDeploymentProvider(type);
            expect(provider).toBeInstanceOf(PublishProfileWebAppContainerDeploymentProvider);
        });
        
    });

    describe('Test Deployment Provider for SPN/RBAC', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });
    
        it("Get Code Deployment Provider for SPN auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => { return {}});

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;
    
            let provider = await DeploymentProviderFactory.getDeploymentProvider(type);
            expect(provider).toBeInstanceOf(WebAppDeploymentProvider);
        });

        it("Get Container Deployment Provider for SPN auth flow", async() => {
            jest.spyOn(ActionParameters, 'getActionParams').mockImplementation(() : any => {
                return {
                    images : 'MOCK_IMAGES'
                }
            });

            let type: DEPLOYMENT_PROVIDER_TYPES = DEPLOYMENT_PROVIDER_TYPES.SPN;
    
            let provider = await DeploymentProviderFactory.getDeploymentProvider(type);
            expect(provider).toBeInstanceOf(WebAppContainerDeploymentProvider);
        });

    });
    
});