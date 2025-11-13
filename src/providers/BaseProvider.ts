import { IProviderConfig, IModelConfig, ModelOptionKey } from "../types/BaseConfigs.js";

/**
 * BaseProvider provides shared helper methods for all AI providers.
 * It does not implement IProvider directly, but providers that extend
 * it will.
 */
export abstract class BaseProvider<TConfig extends IProviderConfig = IProviderConfig> {
    protected client: any = null;
    protected config: TConfig | null = null;

    /**
     * Returns a merged options object by combining model-specific options with runtime options
     * 
     * @param modelConfig Primary config, most likely from the config file
     * @param options Optional runtime config overrides
     * @param key The specific option key to merge (ie: chatOptions, streamOptions, etc.) 
     * @returns Merged options object
     */
    protected mergeConfig = <TModel extends Record<string, any>>(
        modelConfig: TModel,
        options: Partial<TModel[keyof TModel]> | undefined,
        key: ModelOptionKey): Partial<TModel[typeof key]> => {
            return { ...(modelConfig[key] ?? {}), ...(options ?? {}) } as TModel[typeof key];
    }

    /**
     * Ensures that the provider has been initialized before use.
     * 
     * @throws Error if not initialized
     */
    protected ensureInitialized(): void {
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }
    }

    /**
     * Generic helper to validate and merge model options safely.
     * 
     * @param model Name of the model to use 
     * @param options Optional runtime option overrides to use
     * @param key The specific option key to merge (ie: chatOptions, streamOptions, etc.)
     * @returns Object containing modelToUse, modelConfig, and mergedOptions
     */
    protected prepareModelOptions<TModelOptions extends Record<string, any>>(
        model: string | undefined,
        options: Partial<TModelOptions> | undefined,
        key: ModelOptionKey
    ): { modelToUse: string; modelConfig: IModelConfig; mergedOptions: Partial<TModelOptions> } {
        this.ensureInitialized();

        const modelToUse = model || this.config!.defaultModel;
        const modelConfig = this.config!.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);
        }

        const mergedOptions = (this.mergeConfig(modelConfig, options, key) || {}) as Partial<TModelOptions>;
        return { modelToUse, modelConfig, mergedOptions };
    }
}
