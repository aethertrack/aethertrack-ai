import { AIResponse } from "./AIResponseOutput.js";
import { IProviderConfig } from "./BaseConfigs.js";

/**
 * Enumeration of supported AI Provider types
 */
export enum AIProviderType {
    OpenAI = "openai",
    Anthropic = "anthropic",
    HuggingFace = "huggingface",
}

/**
 * Standardized interface for AI Providers that each provider must implement
 * Defines the standard contract that every ai provider (OpenAI, Anthropic, etc.)
 * must implement. It ensures a uniform API across all providers.
 */
export interface IProvider<
    TConfig extends IProviderConfig = IProviderConfig,
    TChatOptions extends Record<string, any> = Record<string, any>,
    TEmbedOptions extends Record<string, any> = Record<string, any>,
    TCompletionOptions extends Record<string, any> = Record<string, any>,
    TStreamOptions extends Record<string, any> = Record<string, any>,
    TImageOptions extends Record<string, any> = Record<string, any>,
    TAudioOptions extends Record<string, any> = Record<string, any>> {

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
    generateText?(prompt: string, model?: string, options?: Partial<TChatOptions>): Promise<AIResponse>;

    /**
     * Generate text using non-chat / legacy completion models
     * 
     * @param prompt The text input to send to the model
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     */
    generateCompletion?(prompt: string, model?: string, options?: Partial<TCompletionOptions>): Promise<AIResponse>;

    /**
     * Streams text generation from the model in chunks.
     * 
     * @param prompt The text input to send to the model
     * @param onChunk Callback function to handle each chunk of streamed data
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     */
    stream?(prompt: string, onChunk: (chunk: any) => void, model?: string, options?: Partial<TStreamOptions>): Promise<AIResponse>;

    /**
     * Queries the provider to generate vector embeddings for the given prompt.
     * 
     * @param prompt The text input to send to the model
     * @param model Optional model name to use (overrides defaultModel in config)
     * @param options Optional parameters specific to the model
     * @returns Promise resolving to the generated response object
     */
    embed?(prompt: string, model?: string, options?: Partial<TEmbedOptions>): Promise<AIResponse>;

    /**
     * Generate an image based on a text prompt.
     * @param prompt Text description for the image.
     * @param model Optional model name (overrides default).
     * @param options Optional image generation parameters.
     */
    generateImage?(prompt: string, model?: string, options?: Partial<TImageOptions>): Promise<AIResponse>;

    /**
     * Edit an existing image using a text prompt.
     * @param image Source image to modify.
     * @param prompt Text prompt describing desired edit.
     * @param model Optional model name (overrides default).
     * @param options Optional image edit parameters.
     */
    editImage?(image: any, prompt: string, model?: string, options?: Partial<TImageOptions>): Promise<AIResponse>;

    /**
     * Process or transcribe audio input.
     * @param audio The audio data or file to process.
     * @param model Optional model name (overrides default).
     * @param options Optional audio processing parameters.
     */
    processAudio?(audio: any, model?: string, options?: Partial<TAudioOptions>): Promise<AIResponse>;
}
