import dotenv from 'dotenv';
import config from 'config';
import { IAppConfig, IProviderConfig } from '../types/BaseConfigs.js';

/**
 * Load and validate the application configuration, merging options and environment vars
 * as needed
 * 
 * @returns AppConfig loaded from config files and environment variables
 */
export function loadAppConfig(): IAppConfig<Record<string, IProviderConfig>> {
    dotenv.config(); // load .env variables

    // Load config from node-config (already merges default + NODE_ENV json)
    const rawConfig = config.util.toObject();

    // Top-level laod as partial to allow for further processing
    const parsed = rawConfig as IAppConfig<Record<string, IProviderConfig>>;

    // Minimal validations
    if (!parsed.providers || Object.keys(parsed.providers).length === 0) {
        throw new Error("At least one provider must be defined in config");
    }

    const appConfig: Record<string, any> = parsed.appConfig || {};    
    const resolvedProviders: Record<string, Record<string, IProviderConfig>> = {};

    // For each provider type in config
    for (const providerType of Object.keys(parsed.providers)) {
        const connections = parsed.providers[providerType];
        
        resolvedProviders[providerType] = {};

        // For each connection under the provider type
        for (const connectionName of Object.keys(connections)) {
            const connectionConfig = connections[connectionName] as IProviderConfig;        

            // Resolve API key env variable
            const apiKeyEnvVar = connectionConfig.apiKeyEnvVar;
            if (!apiKeyEnvVar) {
                throw new Error(`Provider '${providerType}' connection '${connectionName}' missing 'apiKeyEnvVar'`);
            }

            // Resolve the api key from environment vars
            const apiKey = process.env[apiKeyEnvVar];
            if (!apiKey) {
                throw new Error(`Environment variable '${apiKeyEnvVar}' not set for provider '${providerType}' connection '${connectionName}'`);
            }
            
            // Construct final provider config
            resolvedProviders[providerType][connectionName] = {
                ...connectionConfig,
                apiKey, // Inject the actual key
            };            
        }
    }

    return {appConfig, providers: resolvedProviders} as IAppConfig<Record<string, IProviderConfig>>;
}