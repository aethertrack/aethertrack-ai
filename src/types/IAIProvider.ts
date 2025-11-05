/**
 * Standardized interface for AI Providers that each provider must implement
 * Defines the standard contract that every ai provider (OpenAI, Anthropic, etc.)
 * must implement. It ensures a uniform API across all models and providers.
 */
export interface IAIProvider {

    /**
     * Type of ai provider (ie: openai, anthropic, etc.)
     */
    type: string;

    /** 
     * Initialize the provider with necessary configuration
     * 
     * @param config containing apiKey and any optional fields
     * @returns Promise that resolves when initialization is complete
     */
    init(config: any): Promise<void>;

    /**
     * The core text generation function.
     * Merges provider defaults, model defaults, and per-call overrides.
     * 
     * @param prompt The text input to send to the model
     * @param model Generate text using a specific model.
     * @param options Optional parameters specific to the provider/model
     * @returns Promise resolving to the generated response object
     */
    generateText(
        prompt: string,
        model: string,
        options?: Record<string, any>
    ): Promise<any>;
}
