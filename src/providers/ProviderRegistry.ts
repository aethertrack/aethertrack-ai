import { IProviderConfig } from "../types/BaseConfigs.js";
import { IProvider } from "../types/IProvider.js";

/**
 * Registry for AI providers.
 * Supports lazy loading and dynamic creation.
 */
export type ProviderFactory = (config: IProviderConfig) => Promise<IProvider>;

/**
 * Registry for AI Providers
 * Allows dynamic registration and creation of AI provider instances in a plugin type system
 */
export class ProviderRegistry {
    // Maps provider to its factory function
    private static providers: Map<string, ProviderFactory> = new Map();

    /**
     * Register a new provider factory with the registry.
     * Registers the provider lazily.
     * 
     * @param providerName name of the provider to register
     * @param factory factory function to create the provider instance 
     */
    static registerProvider(providerName: string, factory: ProviderFactory): void {
        if (this.providers.has(providerName)) {
            console.warn(`Provider '${providerName}' already registered — overwriting.`);
        }        
        this.providers.set(providerName, factory);
    }

    /**
     * Create a provider instance by name
     * 
     * @param name provider name to create
     * @param config IProviderConfig for the provider instance
     * @throws Error if provider name not found
     * @returns Prmose resolving to the IProvider instance
     */
    static async createProvider(name: string, config: IProviderConfig): Promise<IProvider> {
        const factory = this.providers.get(name);
        if (!factory) {
            throw new Error(`Provider ${name} not registered`);
        }
        return factory(config);
    }

    /**
     * Check if a provider has been registered.
     * 
     * @param providerName name of the provider to check for
     * @returns true if provider is registered, false otherwise
     */
    static hasProvider(providerName: string): boolean {
        return this.providers.has(providerName);
    }
    
    /**
     * Unregister a previously registered provider
     * 
     * @param providerName provider name to unregister
     * @returns true if the provider has been deleted from the registry
     */
    static unregisterProvider(providerName: string): boolean {
        return this.providers.delete(providerName);
    }

    /**
     * List registered provider names
     * @returns array of registered provider names
     */
    static listProviders(): string[] {
        return Array.from(this.providers.keys());
    }        
}