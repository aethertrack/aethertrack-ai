import OpenAI from "openai";
import { IModelConfig, IProviderConfig, ModelOptionKey } from "../../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../../types/IProvider.js";
import { OpenAITextCompletionOptions, OpenAIChatOptions, OpenAIEmbedOptions, OpenAIStreamOptions, OpenAIImageOptions, OpenAIAudioOptions } from "./OpenAITypes.js";
import { BaseProvider } from "../BaseProvider.js";

export class OpenAIProvider 
    extends BaseProvider<IProviderConfig> 
    implements IProvider<
        IProviderConfig,
        OpenAIChatOptions,
        OpenAIEmbedOptions,
        OpenAITextCompletionOptions,
        OpenAIStreamOptions,
        OpenAIImageOptions,
        OpenAIAudioOptions
    > {

    readonly type: AIProviderType = AIProviderType.OpenAI;

    async init(config: IProviderConfig<any>): Promise<void> {
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
        options?: Partial<OpenAIChatOptions>): Promise<any> {

        // Merge options with model config defaults    
        const { modelToUse, mergedOptions } = this.prepareModelOptions<any>(
            model,
            options as any,
            ModelOptionKey.chatOptions
        );

        // Call openai client to call to generate text on the model
        const response = await this.client.responses.create({
            model: modelToUse,
            input: prompt,
            ...mergedOptions,
        });

        return response;
    }

    // Legacy / non-chat text completions
    async generateCompletion(
        prompt: string,
        model?: string,
        options?: Partial<OpenAITextCompletionOptions>
    ): Promise<any> {

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
        const mergedOptions = { ...(modelConfig.completionOptions ?? {}), ...(options ?? {}) };

        const response = await this.client.completions.create({
            model: modelToUse,
            prompt,
            ...options
        });
        return response;
    }

    async stream(
        prompt: string,
        onChunk: (chunk: any) => void,
        model?: string,
        options?: Partial<OpenAIStreamOptions>): Promise<void> {

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

    async embed(prompt: string, model?: string, options?: Partial<OpenAIEmbedOptions>): Promise<any> {
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

    async generateImage(prompt: string, model?: string, options?: Partial<OpenAIImageOptions>): Promise<any> {
        if (!this.client || !this.config) throw new Error("Provider not initialized");
        const mergedOptions = { ...(this.config.models[model || this.config.defaultModel]?.imageOptions ?? {}), ...(options ?? {}) };
        return this.client.images.generate({ prompt, ...mergedOptions });
    }

    async editImage(image: any, prompt: string, model?: string, options?: Partial<OpenAIImageOptions>): Promise<any> {
        if (!this.client || !this.config) throw new Error("Provider not initialized");
        const mergedOptions = { ...(this.config.models[model || this.config.defaultModel]?.imageOptions ?? {}), ...(options ?? {}) };
        return this.client.images.edit({ image, prompt, ...mergedOptions });
    }

    async processAudio(audio: any, model?: string, options?: Partial<OpenAIAudioOptions>): Promise<any> {
        if (!this.client || !this.config) throw new Error("Provider not initialized");

        const modelToUse = model || this.config.defaultModel;
        const modelConfig = this.config.models[modelToUse];
        if (!modelConfig) throw new Error(`Model ${modelToUse} not found`);

        const mergedOptions = { ...(modelConfig.audioOptions ?? {}), ...(options ?? {}) };

        return this.client.audio.transcriptions.create({
            file: audio,
            model: modelToUse,
            ...mergedOptions
        });
    }
}