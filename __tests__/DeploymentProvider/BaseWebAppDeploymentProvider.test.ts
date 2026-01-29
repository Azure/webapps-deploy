import { DEPLOYMENT_PROVIDER_TYPES } from '../../src/DeploymentProvider/Providers/BaseWebAppDeploymentProvider';

// Mock dependencies
jest.mock('@actions/core');
jest.mock('../../src/actionparameters');
jest.mock('azure-actions-appservice-rest/Arm/azure-app-service');
jest.mock('azure-actions-appservice-rest/Utilities/AzureAppServiceUtility');
jest.mock('azure-actions-appservice-rest/Kudu/azure-app-kudu-service');
jest.mock('azure-actions-appservice-rest/Utilities/KuduServiceUtility');

import * as core from '@actions/core';
import { ActionParameters } from '../../src/actionparameters';
import { AzureAppServiceUtility } from 'azure-actions-appservice-rest/Utilities/AzureAppServiceUtility';

describe('Test BaseWebAppDeploymentProvider', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock ActionParameters
        (ActionParameters.getActionParams as jest.Mock) = jest.fn().mockReturnValue({
            endpoint: {},
            resourceGroupName: 'test-rg',
            appName: 'test-app',
            slotName: 'production'
        });
    });

    describe('getWarmupInstanceId', () => {
        
        it('should return first instance when sorted alphabetically', async () => {
            // Arrange
            const mockInstances = {
                value: [
                    { name: 'instance-c' },
                    { name: 'instance-a' },
                    { name: 'instance-b' }
                ]
            };
            
            const mockGetAppserviceInstances = jest.fn().mockResolvedValue(mockInstances);
            const mockGetKuduService = jest.fn().mockResolvedValue({});
            const mockGetApplicationURL = jest.fn().mockResolvedValue('https://test-app.azurewebsites.net');
            
            (AzureAppServiceUtility as jest.Mock).mockImplementation(() => ({
                getAppserviceInstances: mockGetAppserviceInstances,
                getKuduService: mockGetKuduService,
                getApplicationURL: mockGetApplicationURL
            }));

            // Act - We need to create a concrete implementation to test
            const { WebAppDeploymentProvider } = await import('../../src/DeploymentProvider/Providers/WebAppDeploymentProvider');
            const provider = new WebAppDeploymentProvider(DEPLOYMENT_PROVIDER_TYPES.SPN);
            await provider.PreDeploymentStep();
            
            // Assert
            expect(mockGetAppserviceInstances).toHaveBeenCalled();
            // instance-a should be selected (first alphabetically)
            expect(mockGetKuduService).toHaveBeenCalledWith('instance-a');
        });

        it('should return undefined when no instances are available', async () => {
            // Arrange
            const mockGetAppserviceInstances = jest.fn().mockResolvedValue({ value: [] });
            const mockGetKuduService = jest.fn().mockResolvedValue({});
            const mockGetApplicationURL = jest.fn().mockResolvedValue('https://test-app.azurewebsites.net');
            
            (AzureAppServiceUtility as jest.Mock).mockImplementation(() => ({
                getAppserviceInstances: mockGetAppserviceInstances,
                getKuduService: mockGetKuduService,
                getApplicationURL: mockGetApplicationURL
            }));

            // Act
            const { WebAppDeploymentProvider } = await import('../../src/DeploymentProvider/Providers/WebAppDeploymentProvider');
            const provider = new WebAppDeploymentProvider(DEPLOYMENT_PROVIDER_TYPES.SPN);
            await provider.PreDeploymentStep();
            
            // Assert
            expect(mockGetKuduService).toHaveBeenCalledWith(undefined);
        });

        it('should handle errors gracefully and return undefined', async () => {
            // Arrange
            const mockGetAppserviceInstances = jest.fn().mockRejectedValue(new Error('API Error'));
            const mockGetKuduService = jest.fn().mockResolvedValue({});
            const mockGetApplicationURL = jest.fn().mockResolvedValue('https://test-app.azurewebsites.net');
            
            (AzureAppServiceUtility as jest.Mock).mockImplementation(() => ({
                getAppserviceInstances: mockGetAppserviceInstances,
                getKuduService: mockGetKuduService,
                getApplicationURL: mockGetApplicationURL
            }));

            // Act
            const { WebAppDeploymentProvider } = await import('../../src/DeploymentProvider/Providers/WebAppDeploymentProvider');
            const provider = new WebAppDeploymentProvider(DEPLOYMENT_PROVIDER_TYPES.SPN);
            await provider.PreDeploymentStep();
            
            // Assert
            expect(core.debug).toHaveBeenCalledWith(expect.stringContaining('Failed to get app service instances'));
            expect(mockGetKuduService).toHaveBeenCalledWith(undefined);
        });
    });
});
