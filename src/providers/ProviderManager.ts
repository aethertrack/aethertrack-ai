import { ProviderRegistry } from "./ProviderRegistry.js";
import { AIProviderType, IProvider } from "../types/IProvider.js";
import { IProviderConfig } from "../types/BaseConfigs.js";

/**
 * Manages active provider instances at runtime.
 * 
 * Uses ProviderRegistry factories for creation, but caches initialized providers for reuse.
 */
export class ProviderManager {
    // Store active provider instances using providerType and instanceKey as key
    // Key format: `${providerType}:${connectionName}`
    private static providerCache: Map<string, IProvider> = new Map();

    /**
     * Get an existing provider instance, or lazily create one if needed.
     * 
     * @param providerType provider type, e.g. "openai"
     * @param connectionName the connection name in the config 
     * @param config config for initialization (used if creating)
     * @param useCache whether to cache the instance (default true)
     * @returns Promise resolving to the IProvider instance
     * @throws Error if provider not registered
     */
    static async getProvider(providerType: AIProviderType, connectionName: string, config: IProviderConfig, useCache: boolean = true): Promise<IProvider> {
        // cache key for the provider instance
        const cacheKey = `${providerType}:${connectionName}`; // provider unique cache key

        // Return cached instance if available
        if (useCache && this.providerCache.has(cacheKey)) {
            return this.providerCache.get(cacheKey)!;
        }
        
        // Lazily create provider using registry
        if (!ProviderRegistry.hasProvider(providerType)) {
            throw new Error(`Provider type '${providerType}' not registered in ProviderRegistry`);
        }        
        
        const provider = await ProviderRegistry.createProvider(providerType, config);

        if (useCache) {
            this.providerCache.set(cacheKey, provider);
        }

        return provider;
    }

    /**
     * Check if a provider instance exists in the cache
     * 
     * @param providerType provider type to check
     * @param connectionName name of the connection
     * @returns true if provider instance exists, false otherwise
     */
    static hasProviderInstance(providerType: AIProviderType, connectionName: string): boolean {
        return this.providerCache.has(`${providerType}:${connectionName}`);
    }

    /**
     * List cached provider instances
     * 
     * @returns array of cached provider keys
     */
    static listCachedProviders(): string[] {
        return Array.from(this.providerCache.keys());
    }    

    /**
     * Clear a cached provider instance
     * 
     * @param providerType provider type to clear
     * @param connectionName name of the connection to delete
     * @returns true if the provider instance was deleted, false if not found
     */
    static clearProviderInstance(providerType: AIProviderType, connectionName: string): boolean {
        return this.providerCache.delete(`${providerType}:${connectionName}`);
    }

    /**
     * Clear all cached provider instances
     */
    static clearAll(): void {
        this.providerCache.clear();
    }    
}