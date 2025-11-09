import { IModelConfig, IProviderConfig } from "./BaseConfigs.js";

/**
 * Enumeration of supported AI Provider types
 */
export enum AIProviderType {
    OpenAI = "openai",
    Anthropic = "anthropic",
}

/**
 * Standardized interface for AI Providers that each provider must implement
 * Defines the standard contract that every ai provider (OpenAI, Anthropic, etc.)
 * must implement. It ensures a uniform API across all models and providers.
 */
export interface IProvider<TConfig extends IProviderConfig = IProviderConfig> {
    /**
     * Type of ai provider (ie: openai, anthropic, etc.)
     */
    readonly type: AIProviderType;
    
    /** 
     * Initialize the provider with necessary configuration
     * 
     * @param config Configuration object specific to the provider
     * @returns Promise that resolves when initialization is complete
     */     
    init(config: TConfig): Promise<void>;

    /**
     * The core text generation function.
     * 
     * @param prompt The text input to send to the model
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     * @returns Promise resolving to the generated response object
     */    
    generateText?(prompt: string, model?: string, options?: Partial<IModelConfig["genOptions"]>): Promise<any>;

    /**
     * Streams text generation from the model in chunks.
     * 
     * @param prompt The text input to send to the model
     * @param onChunk Callback function to handle each chunk of streamed data
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     */
    stream?(prompt: string, onChunk: (chunk: any) => void, model?: string, options?: Partial<IModelConfig["streamOptions"]>): Promise<void>;

    /**
     * Queries the provider to generate embeddings for the given prompt.
     * 
     * @param prompt The text input to send to the model
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     * @returns Promise resolving to the generated response object
     */
    embed?(prompt: string, model?: string, options?: Partial<IModelConfig["embedOptions"]>): Promise<any>;    
}
