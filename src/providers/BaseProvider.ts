import { IProviderConfig, IModelConfig, ModelOptionKey, ModelRole } from "../types/BaseConfigs.js";

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
     * Find the default model for a given role from the provider config.
     * 
     * @param providerConfig provider configuration
     * @param role role to find the model for
     * @returns model name associated with the given role
     */
    protected getDefaultModelForRole(providerConfig: IProviderConfig, role: ModelRole): string | null {
        const models = providerConfig.models;
        for (const modelName in models) {
            const modelConfig = models[modelName];
            if (modelConfig.roles?.includes(role)) {
                return modelName;
            }
        }
        return null;
    }    

    /**
     * Generic helper to validate and merge model options safely.
     * 
     * @param model Name of the model to use 
     * @param options Optional runtime option overrides to use
     * @param key The specific option key to merge (ie: chatOptions, streamOptions, etc.)
     * @param role Optional role to find default model if model not provided
     * @returns Object containing modelToUse, modelConfig, and mergedOptions
     * @throws Error if model not found or provider not initialized
     */
    protected prepareModelOptions<TModelOptions extends Record<string, any>>(
        model?: string,
        options?: Partial<TModelOptions>,
        key?: ModelOptionKey,
        role?: ModelRole
    ): { modelToUse: string; modelConfig: IModelConfig; mergedOptions: Partial<TModelOptions> } {
        
        this.ensureInitialized();

        // Determine the model to use
        let modelToUse = model;

        if(!modelToUse && role) {
            modelToUse = this.getDefaultModelForRole(this.config!, role) || undefined;
        }

        // Fallback to provider's default model
        if (!modelToUse) {
            modelToUse = this.config!.defaultModel;
        }

        if (!modelToUse) {
            throw new Error(`No model found for role ${role ?? "unknown"} in provider config`);
        }        

        // Fetch the model configuration from provider config
        const modelConfig = this.config!.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model '${modelToUse}' not found in provider config`);
        }

        // Validate role
        if (role && !modelConfig.roles.includes(role)) {

            // Get all models that support the role
            const available = Object.entries(this.config!.models)
                .filter(([, cfg]) => cfg.roles.includes(role))
                .map(([name]) => name);
            
            // Create string suggestion message
            const suggestion = available.length > 0
                ? `\nModels supporting '${role}': ${available.join(", ")}`
                : `\n(No models in this provider support role '${role}')`;                

            throw new Error(
                `Model '${modelToUse}' does NOT support required role '${role}'.\n` +
                `Supported roles for '${modelToUse}': ${modelConfig.roles.join(", ")}${suggestion}`
            );
        }        

        // Select the correct default options based on key
        let defaultOptions: Partial<TModelOptions> = {};
        if (key) {
            switch (key) {
                case ModelOptionKey.ChatOptions:
                    defaultOptions = (modelConfig.chatOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Completion:
                    defaultOptions = (modelConfig.completionOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Stream:
                    defaultOptions = (modelConfig.streamOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Embed:
                    defaultOptions = (modelConfig.embedOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Image:
                    defaultOptions = (modelConfig.imageOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Audio:
                    defaultOptions = (modelConfig.audioOptions ?? {}) as Partial<TModelOptions>;
                    break;
                case ModelOptionKey.Video:
                    defaultOptions = (modelConfig.videoOptions ?? {}) as Partial<TModelOptions>;
                    break;             
                case ModelOptionKey.Moderation:
                    defaultOptions = (modelConfig.moderationOptions ?? {}) as Partial<TModelOptions>;
                    break;                               
                default:
                    defaultOptions = {};
            }
        }        

        // Merge default model options with runtime overrides
        const mergedOptions = { ...defaultOptions, ...(options ?? {}) };

        return { modelToUse, modelConfig, mergedOptions };
      
    }
}
