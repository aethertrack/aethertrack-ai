import { IModelConfig } from "./BaseConfigs";

/**
 * Enumeration of supported AI Provider types
 */
export enum AIProviderType {
    OpenAI = "openai",
}

/**
 * Standardized interface for AI Providers that each provider must implement
 * Defines the standard contract that every ai provider (OpenAI, Anthropic, etc.)
 * must implement. It ensures a uniform API across all models and providers.
 */
export interface IProvider<TConfig = any> {
    /**
     * Type of ai provider (ie: openai, anthropic, etc.)
     */
    readonly type: AIProviderType;
    
    /** Initialize the provider with necessary configuration
     * 
     * @param config Configuration object specific to the provider
     * @returns Promise that resolves when initialization is complete
     */     
    init(config: TConfig): Promise<void>;

    /**
     * The core text generation function. Every provider must support this
     * 
     * @param prompt The text input to send to the model
     * @param options Optional parameters specific to the provider/model
     * @returns Promise resolving to the generated response object
     */
    
    generateText(prompt: string, options?: Partial<IModelConfig["genOptions"]>): Promise<any>;
}
