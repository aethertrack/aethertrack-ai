import config from 'config';
import { IAppConfig, IProviderConfig } from '../types/BaseConfigs';
import { IProviderRegistry } from '../types/IProviderRegistry';

/**
 * Load and validate the application configuration, merging options and environment vars
 * as needed
 * 
 * @returns AppConfig loaded from config files and environment variables
 */
export function loadAppConfig(): IAppConfig<IProviderRegistry> {
    // Load config from node-config (already merges default + NODE_ENV json)
    const rawConfig = config.util.toObject();

    // Top-level laod as partial to allow for further processing
    const parsed = rawConfig as IAppConfig<Partial<IProviderRegistry>>;

    // Minimal validations
    if (!parsed.defaultProvider) {
        throw new Error("defaultProvider must be defined in config");
    }

    if (!parsed.providers || Object.keys(parsed.providers).length === 0) {
        throw new Error("At least one provider must be defined in config");
    }

    // Merge provider defaults into per-provider api keys from environment variables
    for (const provider of Object.values(parsed.providers)) {
        const p = provider as IProviderConfig;
        
        // Make sure at least 1 model is defined
        if (!p.models || Object.keys(p.models).length === 0) {
            throw new Error(`Provider ${p.name} must define at least one model`);
        }        

        // Inject environment API key if missing
        if (!p.apiKey) {
            const envVar = `${p.name.toUpperCase()}_API_KEY`;
            if (process.env[envVar]) {
                p.apiKey = process.env[envVar];
            }
        }
    }

    return parsed as IAppConfig<IProviderRegistry>;
}