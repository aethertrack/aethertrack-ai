import OpenAI from "openai";
import { AIProviderType, IAIProvider } from "../types/IAIProvider";
import { OpenAIProviderConfig } from "../types/schemas/OpenAISchema";

/**
 * OpenAIProvider implements the IAIProvider interface
 * connecting to OpenAI's models via the official SDK
 */
export class OpenAIProvider implements IAIProvider<OpenAIProviderConfig> {
    type = AIProviderType.OpenAI;

    /** OpenAI client instance and configs */
    private client: OpenAI | null = null;
    private config: OpenAIProviderConfig | null = null;

    /**
     * Initializes the OpenAI client with the given configuration.
     *
     * @param config configs containing apiKey and any optional fields
     * @throws Error if no config found or no API key is provided
     */
    async init(config: OpenAIProviderConfig): Promise<void> {
        if (!config.apiKey) {
            throw new Error("OpenAI API key is required in config");
        }

        this.config = config;

        // Create the OpenAI client instance with the provided API key and options
        this.client = new OpenAI({ apiKey: config.apiKey });
    }

    async generateText(prompt: string, model: string, options: Record<string, any> = {}): Promise<any> {
        console.log(prompt, model, options);

        if (!this.client || !this.config) {
            throw new Error("OpenAI API client not initialized.");
        }
        const modelConfig = this.config.providerOptions.models?.[model];
        if (!modelConfig) {
            throw new Error(`Model "${model}" not found`);
        }

        const mergedOptions = {
            ...modelConfig.genOptions,
            ...options,
        };

        const response = await this.client.responses.create({
            model,
            input: prompt,
            ...mergedOptions,
        });

        return response.output_text;
    }

    async embed(
        input: string | string[],
        modelName = "text-embedding-3-large",
        options: Record<string, any> = {}
    ): Promise<number[][]> {
        if (!this.client || !this.config) {
            throw new Error("OpenAI not initialized");
        }

        const modelConfig = this.config.providerOptions.models[modelName];
        if (!modelConfig?.embedOptions) {
            throw new Error(`No embedding config found for model: ${modelName}`);
        }

        const embedOpts = modelConfig.embedOptions;

        const mergedOptions = {
            ...modelConfig.embedOptions,
            ...options,
        };

        const response = await this.client.embeddings.create({
            model: modelName,
            input,
            encoding_format: mergedOptions.encodingFormat ?? "float",
            dimensions: mergedOptions.dimensions ?? undefined,
        });

        return response.data.map((item) => item.embedding);
    }

    async stream(prompt: string, model: string, options?: { genOptions?: Record<string, any>; }): AsyncIterable<string> | Promise<AsyncIterable<string>> {
        throw new Error("Method not implemented.");
    }    
}