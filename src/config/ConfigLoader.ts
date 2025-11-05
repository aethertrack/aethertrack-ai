import config from 'config';
import { AppConfig, AppConfigSchema, providerSchemaMap } from '../types/schemas/AppConfigSchema';

/**
 * Load and validate the application configuration, merging options and environment vars
 * as needed
 * 
 * @returns AppConfig loaded from config files and environment variables
 */
export function loadAppConfig(): AppConfig {
    // Load config from node-config (already merges default + NODE_ENV json)
    const rawConfig = config.util.toObject();

    // Top-level validation
    const parsedConfig = AppConfigSchema.parse(rawConfig);

    // Merge provider defaults into per-model genOptions
    for (const provider of Object.values(parsedConfig.providers)) {
        // Inject environment API key if missing
        if (!provider.apiKey) {
            const envVar = `${provider.name.toUpperCase()}_API_KEY`;
            if (process.env[envVar]) {
                provider.apiKey = process.env[envVar];
            }
        }
    }
    return parsedConfig;
}
