import { ProviderRegistry } from "./ProviderRegistry.js";
import { IProvider } from "../types/IProvider.js";
import { IProviderConfig } from "../types/BaseConfigs.js";

/**
 * Manages active provider instances at runtime.
 * 
 * Uses ProviderRegistry factories for creation,
 * but caches initialized providers for reuse.
 */
export class ProviderManager {
    // Store active provider instances
    private static instances: Map<string, IProvider> = new Map();

    /**
     * Get an existing provider instance, or lazily create one.
     * 
     * @param name provider key, e.g. "openai"
     * @param config config for initialization (used if creating)
     * @returns Promise resolving to the IProvider instance
     * @throws Error if provider not registered
     */
    static async getProvider(name: string, config: IProviderConfig): Promise<IProvider> {
        // Return cached instance if available
        if (this.instances.has(name)) {
            return this.instances.get(name)!;
        }

        // Lazily create provider using registry
        if (!ProviderRegistry.hasProvider(name)) {
            throw new Error(`Provider '${name}' not registered.`);
        }

        const provider = await ProviderRegistry.createProvider(name, config);
        this.instances.set(name, provider);
        return provider;
    }

    /**
     * Check if a provider instance already exists in cache
     * 
     * @param name provider key
     */
    static hasProviderInstance(name: string): boolean {
        return this.instances.has(name);
    }

    /**
     * Remove a cached provider instance.
     * Useful for refreshing or shutting down providers.
     */
    static async unloadProvider(name: string): Promise<void> {
        if (this.instances.has(name)) {
            const instance = this.instances.get(name)!;
            // If provider implements a cleanup hook, call it
            if (typeof (instance as any).shutdown === "function") {
                await (instance as any).shutdown();
            }
            this.instances.delete(name);
        }
    }

    /**
     * Reload a provider (destroy and recreate)
     */
    static async reloadProvider(name: string, config: IProviderConfig): Promise<IProvider> {
        await this.unloadProvider(name);
        return this.getProvider(name, config);
    }

    /**
     * List currently active provider instance keys
     */
    static listActiveProviders(): string[] {
        return Array.from(this.instances.keys());
    }

    /**
     * Remove all active providers (e.g., on app shutdown)
     */
    static async clearAll(): Promise<void> {
        for (const name of this.instances.keys()) {
            await this.unloadProvider(name);
        }
    }
}
