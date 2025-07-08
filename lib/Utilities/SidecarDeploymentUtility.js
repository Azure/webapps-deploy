"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidecarDeploymentUtility = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
class SidecarDeploymentUtility {
    /**
     * Parses sidecar configuration from JSON string or file path
     * @param sidecarConfig JSON string or file path containing sidecar configuration
     * @returns Parsed sidecar configuration object
     */
    static parseSidecarConfig(sidecarConfig) {
        if (!sidecarConfig) {
            throw new Error("Sidecar configuration is required for sidecar deployment");
        }
        let configContent;
        try {
            // Check if it's a file path
            if (fs.existsSync(sidecarConfig)) {
                const stats = fs.statSync(sidecarConfig);
                if (stats.isFile()) {
                    configContent = fs.readFileSync(sidecarConfig, 'utf8');
                    core.debug(`Loaded sidecar configuration from file: ${sidecarConfig}`);
                }
                else {
                    throw new Error(`Sidecar configuration path is not a file: ${sidecarConfig}`);
                }
            }
            else {
                // Assume it's a JSON string
                configContent = sidecarConfig;
                core.debug("Using sidecar configuration as JSON string");
            }
        }
        catch (error) {
            // If file reading fails, treat as JSON string
            configContent = sidecarConfig;
            core.debug("Treating sidecar configuration as JSON string due to file access error");
        }
        try {
            const config = JSON.parse(configContent);
            this.validateSidecarConfig(config);
            return config;
        }
        catch (error) {
            throw new Error(`Invalid sidecar configuration JSON: ${error.message}`);
        }
    }
    /**
     * Validates the sidecar configuration structure
     * @param config Sidecar configuration to validate
     */
    static validateSidecarConfig(config) {
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
    static generateSiteContainersConfig(mainImage, sidecarConfig) {
        const containers = [];
        // Add main application container
        containers.push({
            name: "main-app",
            image: mainImage,
            isMain: true
        });
        // Add sidecar containers
        sidecarConfig.containers.forEach(sidecar => {
            const containerConfig = {
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
    static validateSidecarDeployment(actionParams) {
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
exports.SidecarDeploymentUtility = SidecarDeploymentUtility;
