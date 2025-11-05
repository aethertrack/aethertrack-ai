import OpenAI from "openai";
import { IAIProvider } from "../types/IAIProvider";
import { BaseProviderConfigSchema } from "../types/schemas/BaseSchema";
import { OpenAIProviderConfig } from "../types/schemas/OpenAISchema";


/**
 * OpenAIProvider implements the IAIProvider interface
 * connecting to OpenAI's models via the official SDK
 */
export class OpenAIProvider implements IAIProvider {
    type = "openai";

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
}