import config from 'config';
import { AppConfigSchema, AppConfig, ProviderConfig } from './schema';

/**
 * Merge providers by name so environment-specific files can override 
 * individual fields (apiKey, options, etc.)
 * 
 * @param providers 
 * @returns 
 */
function mergeProviders(providers: ProviderConfig[]): ProviderConfig[] {
    const map = new Map<string, ProviderConfig>();

    for (const provider of providers) {
        const existing = map.get(provider.name);
        if (existing) {
            // Deep merge fields, preserving nested options
            map.set(provider.name, {
                ...existing,
                ...provider,
                providerOptions: { ...(existing.providerOptions || {}), ...(provider.providerOptions || {}) }
            });
        } else {
            map.set(provider.name, provider);
        }
    }

    return Array.from(map.values());
}

/**
 * Load and validate the application configuration, merging options and environment vars
 * as needed
 * 
 * @returns AppConfig loaded from config files and environment variables
 */
export function loadAppConfig(): AppConfig {
    // Load config from node-config (already merges default + NODE_ENV json)
    const rawConfig = config.util.toObject();

    // Merge providers array by name
    const mergedProviders = mergeProviders(rawConfig.providers || []);

    // Inject .env API keys if missing
    for (const p of mergedProviders) {
        const envVar = `${p.name.toUpperCase()}_API_KEY`;
        if (!p.apiKey && process.env[envVar]) {
            p.apiKey = process.env[envVar];
        }
    }

    const finalConfig = {
        ...rawConfig,
        providers: mergedProviders
    };

    // Validate with Zod
    return AppConfigSchema.parse(finalConfig);
}
