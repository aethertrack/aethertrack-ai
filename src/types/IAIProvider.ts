import { BaseProviderConfig } from "./schemas/BaseSchema";

/**
 * Enumeration of supported AI Provider types
 */
export enum AIProviderType {
    OpenAI = "openai",
    Anthropic = "anthropic",
    HuggingFace = "huggingface"
}

/**
 * Standardized interface for AI Providers that each provider must implement
 * Defines the standard contract that every ai provider (OpenAI, Anthropic, etc.)
 * must implement. It ensures a uniform API across all models and providers.
 */
export interface IAIProvider<T extends BaseProviderConfig = BaseProviderConfig> {

    /**
     * Type of ai provider (ie: openai, anthropic, etc.)
     */
    type: AIProviderType;

    /** 
     * Initialize the provider with necessary configuration
     * 
     * @param config containing apiKey and any optional fields
     * @returns Promise that resolves when initialization is complete
     */
    init(config: T): Promise<void>;

    /**
     * The core text generation function.
     * Merges provider defaults, model defaults, and per-call overrides.
     * 
     * @param prompt The text input to send to the model
     * @param model Generate text using a specific model.
     * @param options Optional parameters specific to the model
     * @returns Promise resolving to the generated response object
     */
    generateText(
        prompt: string,
        model: string,
        options?: {            
            genOptions?: Record<string, any>;
        }
    ): Promise<any>;

    /**
     * Generate an embedding vector from text input
     * 
     * @param input The text(s) to embed
     * @param model Embedding model name
     * @param options Optional embedding settings (merged from model config)
     * @returns Promise resolving to the generated response object
     */
    embed(
        input: string | string[],
        model: string,
        options?: {            
            embedOptions?: Record<string, any>;
        }
    ): Promise<number[][]>;    

    /**
     * Stream token-by-token responses (for chat completions, etc.)
     * @param prompt The text(s) to send to the model
     * @param model Embedding model name
     * @returns Promise resolving to the generated response object
     * 
     * Implementations should resolve to an async iterator yielding partial tokens or messages.
     */
    stream(
        prompt: string,
        model: string,
        options?: {            
            genOptions?: Record<string, any>;
        }
    ): AsyncIterable<string> | Promise<AsyncIterable<string>>;    
}
