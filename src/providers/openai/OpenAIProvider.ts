import OpenAI from "openai";
import { IModelConfig, IProviderConfig, ModelOptionKey, ModelRole } from "../../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../../types/IProvider.js";
import { OpenAITextCompletionOptions, OpenAIChatOptions, OpenAIEmbedOptions, OpenAIStreamOptions, OpenAIImageOptions, OpenAIAudioOptions } from "./OpenAITypes.js";
import { BaseProvider } from "../BaseProvider.js";
import { AIResponse } from "../../types/AIResponseOutput.js";

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
        options?: Partial<OpenAIChatOptions>): Promise<AIResponse<string>> {

        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAITextCompletionOptions>(
                model,
                options as any,
                ModelOptionKey.ChatOptions,
                ModelRole.Chat
            );

            // Call openai client to call to generate text on the model
            const response = await this.client.responses.create({
                model: modelToUse,
                input: prompt,
                ...mergedOptions,
            });

            return {
                rawResponse: response,
                output: response.output_text ?? response.output?.[0]?.content ?? "",
                error: "",
                metadata: {
                    model: response.model,
                    requestId: response.id,
                    tokensUsed: response.usage?.total_tokens
                }
            };
        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }

    // Legacy / non-chat text completions
    async generateCompletion(
        prompt: string,
        model?: string,
        options?: Partial<OpenAITextCompletionOptions>
    ): Promise<AIResponse<string>> {
        
        console.warn("[openai] generateCompletion() uses legacy completions API. Prefer generateText().");

        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAITextCompletionOptions>(
                model,
                options as any,
                ModelOptionKey.Completion,
                ModelRole.Completion
            );

            const response = await this.client.completions.create({
                model: modelToUse,
                prompt,
                ...mergedOptions
            });

            return {
                rawResponse: response,
                output: response.choices[0]?.text || "",
                error: "",
                metadata: {
                    model: response.model,
                    requestId: response.id,
                    tokensUsed: response.usage?.total_tokens
                }
            };
        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }

    async stream(
        prompt: string,
        onChunk: (chunk: any) => void,
        model?: string,
        options?: Partial<OpenAIStreamOptions>): Promise<AIResponse<string>> {


        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIStreamOptions>(
                model,
                options as any,
                ModelOptionKey.Stream,
                ModelRole.Stream
            );

            // Call openai client to stream text generation
            const stream = await this.client.chat.completions.create({
                model: modelToUse,
                messages: [{ role: "user", content: prompt }],
                stream: true,
                ...mergedOptions,
            });

            // We'll accumulate text so we can return a final AIResponse<string>
            let fullOutput = "";

            // send the resulting chunk text to the onChunk callback
            for await (const chunk of stream) {
                const piece = chunk.choices?.[0]?.delta?.content ?? "";
                if (piece.length > 0) {
                    fullOutput += piece;
                    onChunk(piece);
                }
            }

            // NOTE: OpenAI streaming endpoints don't return a final "response" object,
            return {
                rawResponse: { streamed: true },
                output: fullOutput,
                error: "",
                metadata: {
                    model: modelToUse,
                    requestId: undefined,
                    tokensUsed: undefined
                }
            };

        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }

    async embed(prompt: string, model?: string, options?: Partial<OpenAIEmbedOptions>): Promise<AIResponse<number[]>> {
        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIEmbedOptions>(
                model,
                options as any,
                ModelOptionKey.Embed,
                ModelRole.Embed
            );

            // Call openai client to generate embeddings
            const response = await this.client.embeddings.create({
                model: modelToUse,
                input: prompt,
                ...mergedOptions,
            });

            return {
                rawResponse: response,
                output: response.data?.[0]?.embedding ?? [],
                error: "",
                metadata: {
                    model: response.model,
                    dimensions: response.data?.[0]?.embedding?.length,
                    requestId: response.id
                }
            };
        } catch (err: any) {
            return { output: [], error: err?.message ?? String(err) };
        }
    }

    async generateImage(prompt: string, model?: string, options?: Partial<OpenAIImageOptions>): Promise<AIResponse<any>> {
        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIImageOptions>(
                model,
                options as any,
                ModelOptionKey.Image,
                ModelRole.Image
            );

            const response = await this.client.images.generate({ model: modelToUse, prompt, ...mergedOptions });

            const img = response.data?.[0];
            const output = img?.url ?? img?.b64_json ?? img;

            return {
                rawResponse: response,
                output,
                error: "",
                metadata: {
                    model: modelToUse,
                    requestId: response.id
                }
            };
        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }

    async editImage(image: any, prompt: string, model?: string, options?: Partial<OpenAIImageOptions>): Promise<AIResponse<any>> {
        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIImageOptions>(
                model,
                options as any,
                ModelOptionKey.Image,
                ModelRole.Image
            );

            const response = await this.client.images.edit({ model: modelToUse, image, prompt, ...mergedOptions });
            const img = response.data?.[0];
            const output = img?.url ?? img?.b64_json ?? img;

            return {
                rawResponse: response,
                output,
                error: "",
                metadata: {
                    model: modelToUse,
                    requestId: response.id
                }
            };
        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }

    async processAudio(audio: any, model?: string, options?: Partial<OpenAIAudioOptions>): Promise<AIResponse<string>> {
        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIAudioOptions>(
                model,
                options as any,
                ModelOptionKey.Audio,
                ModelRole.Audio
            );

            const response = await this.client.audio.transcriptions.create({
                file: audio,
                model: modelToUse,
                ...mergedOptions
            });

            return {
                rawResponse: response,
                output: response.text ?? "",
                error: "",
                metadata: {
                    model: modelToUse,
                    requestId: response.id
                }
            };

        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }
    }
}