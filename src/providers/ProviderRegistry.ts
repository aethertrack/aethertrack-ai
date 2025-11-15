import { IProviderConfig } from "../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../types/IProvider.js";

/**
 * Factory for registring for AI providers.
 * Supports lazy loading and dynamic creation.
 */
export type ProviderFactory = (config: IProviderConfig) => Promise<IProvider>;

/**
 * Registry for AI Providers
 * Allows dynamic registration and creation of AI provider instances in a plugin type system
 */
export class ProviderRegistry {
    // Maps providers to its factory function
    private static registry: Map<AIProviderType, ProviderFactory> = new Map();

    /**
     * Register a new provider factory with the registry.
     * 
     * @param providerType type of the provider to register
     * @param factory factory function to create the provider instance 
     */
    static registerProvider(providerType: AIProviderType, factory: ProviderFactory): void {
        if (this.registry.has(providerType)) {
            console.warn(`ProviderRegistry: Provider type '${providerType}' already registered — overwriting.`);
        }        
        this.registry.set(providerType, factory);
    }

    /**
     * Create a provider instance from a given type and config
     * 
     * @param providerType Provider type to create
     * @param config Configuration for the provider
     * @throws Error if provider not registered
     * @returns ProviderFactory
     */
    static createProvider(providerType: AIProviderType, config: IProviderConfig): Promise<IProvider> {
        const factory = this.registry.get(providerType);
        if (!factory) {
            throw new Error(`ProviderRegistry: Provider type '${providerType}' not registered.`);
        }
        return factory(config);
    }

    /**
     * Check if a provider has been registered.
     * 
     * @param providerType type of the provider to check for
     * @returns true if provider is registered, false otherwise
     */
    static hasProvider(providerType: AIProviderType): boolean {
        return this.registry.has(providerType);
    }
    
    /**
     * Unregister a previously registered provider
     * 
     * @param providerType provider type to unregister
     * @returns true if the provider has been deleted from the registry
     */
    static unregisterProvider(providerType: AIProviderType): boolean {
        return this.registry.delete(providerType);
    }

    /**
     * List registered provider names
     * 
     * @returns array of registered provider names
     */
    static listProviders(): string[] {
        return Array.from(this.registry.keys());
    }        
}