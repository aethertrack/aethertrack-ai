import OpenAI from "openai";
import { IModelConfig, IProviderConfig } from "../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../types/IProvider.js";

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

    async generateText(
        prompt: string,
        model?: string,
        options?: Partial<IModelConfig["genOptions"]>): Promise<any> {

        // make sure the provider is initialized and ready
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }

        // If model is not provided, use defaultModel from config
        const modelToUse: string = model || this.config.defaultModel;
        const modelConfig: IModelConfig = this.config.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);
        }

        // Merge options with model config defaults
        const mergedOptions = { ...(modelConfig.genOptions ?? {}), ...(options ?? {}) };

        // Call openai client to call to generate text on the model
        const response = await this.client.responses.create({
            model: modelToUse,
            input: prompt,
            ...mergedOptions,
        });

        return response;
    }

    async stream(
        prompt: string,
        onChunk: (chunk: any) => void,
        model?: string,
        options?: Partial<IModelConfig["streamOptions"]>): Promise<void> {

        // make sure the provider is initialized and ready
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }

        // If model is not provided, use defaultModel from config
        const modelToUse: string = model || this.config.defaultModel;
        const modelConfig: IModelConfig = this.config.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);
        }

        // Merge options with model config defaults
        const mergedOptions = { ...(modelConfig.streamOptions ?? {}), ...(options ?? {}) };

        // Call openai client to stream text generation
        const stream = await this.client.chat.completions.create({
            model: modelToUse,
            messages: [{ role: "user", content: prompt }],
            stream: true,
            ...mergedOptions,
        });

        // send the resulting chunk text to the onChunk callback
        for await (const chunk of stream) {
            onChunk(chunk.choices[0].delta?.content || "");
        }
    }

    async embed(prompt: string, model?: string, options?: Partial<IModelConfig["embedOptions"]>): Promise<any> {
        // make sure the provider is initialized and ready
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }

        // If model is not provided, use defaultModel from config
        const modelToUse: string = model || this.config.defaultModel;
        const modelConfig: IModelConfig = this.config.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);
        }

        // Merge options with model config defaults  
        const mergedOptions = { ...(modelConfig.embedOptions ?? {}), ...(options ?? {}) };
        
        // Call openai client to generate embeddings
        const response = await this.client.embeddings.create({
            model: modelToUse,
            input: prompt,
            ...mergedOptions,
        });

        return response;        
    }
}