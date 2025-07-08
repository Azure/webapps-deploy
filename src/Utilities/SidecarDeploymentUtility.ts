import * as core from '@actions/core';
import * as fs from 'fs';
import { ActionParameters } from '../actionparameters';

export interface SidecarContainer {
    name: string;
    image: string;
    environment?: { [key: string]: string };
    ports?: number[];
    command?: string[];
    volumeMounts?: { [key: string]: string };
}

export interface SidecarConfiguration {
    containers: SidecarContainer[];
}

export class SidecarDeploymentUtility {
    
    /**
     * Parses sidecar configuration from JSON string or file path
     * @param sidecarConfig JSON string or file path containing sidecar configuration
     * @returns Parsed sidecar configuration object
     */
    public static parseSidecarConfig(sidecarConfig: string): SidecarConfiguration {
        if (!sidecarConfig) {
            throw new Error("Sidecar configuration is required for sidecar deployment");
        }

        let configContent: string;
        
        try {
            // Check if it's a file path
            if (fs.existsSync(sidecarConfig)) {
                const stats = fs.statSync(sidecarConfig);
                if (stats.isFile()) {
                    configContent = fs.readFileSync(sidecarConfig, 'utf8');
                    core.debug(`Loaded sidecar configuration from file: ${sidecarConfig}`);
                } else {
                    throw new Error(`Sidecar configuration path is not a file: ${sidecarConfig}`);
                }
            } else {
                // Assume it's a JSON string
                configContent = sidecarConfig;
                core.debug("Using sidecar configuration as JSON string");
            }
        } catch (error) {
            // If file reading fails, treat as JSON string
            configContent = sidecarConfig;
            core.debug("Treating sidecar configuration as JSON string due to file access error");
        }

        try {
            const config: SidecarConfiguration = JSON.parse(configContent);
            this.validateSidecarConfig(config);
            return config;
        } catch (error) {
            throw new Error(`Invalid sidecar configuration JSON: ${error.message}`);
        }
    }

    /**
     * Validates the sidecar configuration structure
     * @param config Sidecar configuration to validate
     */
    private static validateSidecarConfig(config: SidecarConfiguration): void {
        if (!config || !config.containers || !Array.isArray(config.containers)) {
            throw new Error("Sidecar configuration must contain a 'containers' array");
        }

        if (config.containers.length === 0) {
            throw new Error("Sidecar configuration must contain at least one container");
        }

        config.containers.forEach((container, index) => {
            if (!container.name || typeof container.name !== 'string') {
                throw new Error(`Container at index ${index} must have a valid 'name' property`);
            }

            if (!container.image || typeof container.image !== 'string') {
                throw new Error(`Container '${container.name}' must have a valid 'image' property`);
            }

            // Validate optional properties
            if (container.environment && typeof container.environment !== 'object') {
                throw new Error(`Container '${container.name}' environment must be an object`);
            }

            if (container.ports && !Array.isArray(container.ports)) {
                throw new Error(`Container '${container.name}' ports must be an array`);
            }

            if (container.command && !Array.isArray(container.command)) {
                throw new Error(`Container '${container.name}' command must be an array`);
            }

            if (container.volumeMounts && typeof container.volumeMounts !== 'object') {
                throw new Error(`Container '${container.name}' volumeMounts must be an object`);
            }
        });
    }

    /**
     * Generates the siteContainers configuration for Azure App Service
     * @param mainImage The main application container image
     * @param sidecarConfig Parsed sidecar configuration
     * @returns Array of container configurations for Azure App Service
     */
    public static generateSiteContainersConfig(mainImage: string, sidecarConfig: SidecarConfiguration): any[] {
        const containers: any[] = [];

        // Add main application container
        containers.push({
            name: "main-app",
            image: mainImage,
            isMain: true
        });

        // Add sidecar containers
        sidecarConfig.containers.forEach(sidecar => {
            const containerConfig: any = {
                name: sidecar.name,
                image: sidecar.image,
                isMain: false
            };

            if (sidecar.environment) {
                containerConfig.environmentVariables = Object.entries(sidecar.environment).map(([name, value]) => ({
                    name,
                    value
                }));
            }

            if (sidecar.command && sidecar.command.length > 0) {
                containerConfig.command = sidecar.command;
            }

            if (sidecar.ports && sidecar.ports.length > 0) {
                containerConfig.targetPort = sidecar.ports[0]; // Azure App Service typically uses the first port
            }

            containers.push(containerConfig);
        });

        return containers;
    }

    /**
     * Validates that sidecar deployment requirements are met
     * @param actionParams Action parameters to validate
     */
    public static validateSidecarDeployment(actionParams: ActionParameters): void {
        if (!actionParams.images) {
            throw new Error("Main application image is required for sidecar deployment. Provide the main container image in the 'images' input.");
        }

        if (!actionParams.sidecarConfig) {
            throw new Error("Sidecar configuration is required when performing sidecar deployment.");
        }

        if (!actionParams.isLinux) {
            throw new Error("Sidecar deployment is only supported on Linux-based Azure App Services.");
        }
    }
}