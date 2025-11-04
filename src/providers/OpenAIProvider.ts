import OpenAI from "openai";
import { AIProviderType, IAIProvider } from "./IAIProvider";
import { IAIGenerationConfig } from "../types/IAIGenerationConfig";
import { IAIProviderConfig } from "../types/IAIProviderConfig";
import { AppConfig } from "../config/schema";

/**
 * OpenAIProvider implements the IAIProvider interface
 * connecting to OpenAI's models via the official SDK
 */
export class OpenAIProvider implements IAIProvider {
    type = AIProviderType.OpenAI;

    /** Internal OpenAI client instance */
    private client: OpenAI | null = null;

    /**
     * Initializes the OpenAI client with the given configuration.
     *
     * @param config AppConfig containing apiKey and any optional fields
     * @throws Error if no API key is provided
     */    
    async init(appConfig: AppConfig): Promise<void> {
        const providerConfig: IAIProviderConfig | undefined = appConfig.providers.find(
            (provider) => provider.name === this.type
        );

        if (!providerConfig) {
            throw new Error(`No configuration found for provider: ${this.type}`);
        }

        if (!providerConfig.apiKey) {
            throw new Error("OpenAI API key is required in config");
        }

        // Create the OpenAI client instance with the provided API key and options
        this.client = new OpenAI({ apiKey: providerConfig.apiKey });
    }

    async generateText(prompt: string, options?: IAIGenerationConfig): Promise<any> {
        if (!this.client) {
            throw new Error("OpenAI API client not initialized.");
        }

        throw new Error("Method not implemented.");
    }
}