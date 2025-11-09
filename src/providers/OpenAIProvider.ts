import OpenAI from "openai";
import { IModelConfig, IProviderConfig } from "../types/BaseConfigs";
import { AIProviderType, IProvider } from "../types/IProvider";

export class OpenAIProvider implements IProvider<IProviderConfig> {
    type: AIProviderType = AIProviderType.OpenAI;

    private client: OpenAI | null = null;
    private config: IProviderConfig | null = null;

    async init(config: IProviderConfig): Promise<void> {
        // Initialization logic for OpenAI provider
        if (!config.apiKey) {
            throw new Error("OpenAI API key required but not found in config. Check .env file");
        }
        this.client = new OpenAI({ apiKey: config.apiKey });
        this.config = config;        
    }

    async generateText(prompt: string, model?: string, options?: Partial<IModelConfig["genOptions"]>): Promise<any> {
        // make sure the provider is initialized and ready
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }

        // If model is not provided, use defaultModel from config
        const modelToUse:string = model || this.config.defaultModel;
        const modelConfig:IModelConfig = this.config.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);        
        }

        // Merge options with model config defaults
        const mergedOptions = { ...modelConfig.genOptions, ...options };

        // Call openai client to call to generate text on the model
        const response = await this.client.responses.create({
            model: modelToUse,
            input: prompt,
            ...mergedOptions,
        });

        return response;        
    }    
}