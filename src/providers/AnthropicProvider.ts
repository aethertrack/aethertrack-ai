import Anthropic from '@anthropic-ai/sdk';

import { AIProviderType, IProvider } from "../types/IProvider.js";
import { IModelConfig, IProviderConfig } from '../types/BaseConfigs.js';

export class AnthropicProvider implements IProvider {
    type = AIProviderType.Anthropic;

    private client: Anthropic | null = null;
    private config: IProviderConfig | null = null;

    async init(config: IProviderConfig): Promise<void> {
        if (!config.apiKey) {
            throw new Error("Anthropic API key required in config");
        }

        this.config = config;
        this.client = new Anthropic({ apiKey: config.apiKey });
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

        // Call anthropic client to call to generate text on the model
        const response = await this.client.messages.create({
            max_tokens: 1024,
            model: modelToUse,
            messages: [{ role: 'user', content: prompt }],
            ...mergedOptions,
        });

        return response;
    }

    async stream(
        prompt: string,
        onChunk: (chunk: any) => void,
        model?: string,
        options?: Partial<IModelConfig["streamOptions"]>): Promise<void> {

        // Stream is just generateText with stream option enabled
        const mergedOptions = {
            stream: true,
            ...(options ?? {})
        };

        
        const stream = await this.generateText(prompt, model, mergedOptions);

        // send the resulting chunk text to the onChunk callback
        for await (const chunk of stream) {
            onChunk(chunk);
        }
    }
}
