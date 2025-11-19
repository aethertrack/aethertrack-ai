import OpenAI from "openai";
import { IProviderConfig, ModelOptionKey, ModelRole } from "../../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../../types/IProvider.js";
import { OpenAITextCompletionOptions, OpenAIChatOptions, OpenAIEmbedOptions, OpenAIStreamOptions, OpenAIImageOptions, OpenAIAudioOptions, OpenAIVideoOptions } from "./OpenAITypes.js";
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
        OpenAIAudioOptions,
        OpenAIVideoOptions
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

    async generateImageVariation(image: any, prompt: string, model?: string, options?: Partial<OpenAIImageOptions>): Promise<AIResponse<any>> {
        try {
            // Merge options with model config defaults    
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIImageOptions>(
                model,
                options as any,
                ModelOptionKey.Image,
                ModelRole.Image);

            // Try images.edit with an `image` param and a variation prompt
            const response = await this.client.images.edit({
                model: modelToUse,
                prompt: "Make a variation",
                image,
                ...mergedOptions
            });

            const item = response.data?.[0];
            const output = item?.url ?? item?.b64_json ?? item ?? null;

            return {
                rawResponse: response,
                output,
                error: "",
                metadata: {
                    model: modelToUse,
                    requestId:
                        response.id
                }
            };

        } catch (err: any) {
            return { output: null, error: err?.message ?? String(err) };
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

    async generateSpeech(text: string, model?: string, options?: Partial<OpenAIAudioOptions>): Promise<AIResponse<Buffer>> {
        try {
            // Use same transcription endpoint with translate flag depending on support
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIAudioOptions>(model, options as any, ModelOptionKey.Audio, ModelRole.Audio);

            const response = await this.client.audio.speech.create({
                input: text,
                model: modelToUse,
                ...mergedOptions
            });

            // Some SDKs return base64, others return a Buffer/stream. Handle common cases.
            const audioB64 = response?.audio ?? response?.b64_json ?? null;
            const buffer = audioB64 ? Buffer.from(audioB64, "base64") : (response as Buffer);            

            return { 
                rawResponse: response, 
                output: buffer, 
                error: "", 
                metadata: { 
                    model: modelToUse, 
                    requestId: response.id 
                } 
            };
        } catch (err: any) {
            return { output: Buffer.from([]), error: err?.message ?? String(err) };
        }
    }

    async translateAudio(file: File, model?: string, options?: Partial<OpenAIAudioOptions>): Promise<AIResponse<string>> {
        try {
            // Use same transcription endpoint with translate flag depending on support
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIAudioOptions>(model, options as any, ModelOptionKey.Audio, ModelRole.Audio);

            const response = await this.client.audio.transcriptions.create({
                file,
                model: modelToUse,
                translate: true,
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

    async generateVideo(prompt: string, model?: string, options?: Record<string, any>): Promise<AIResponse<any>> {
        try {
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIVideoOptions>(model, options as any, ModelOptionKey.Video, ModelRole.Video);

            const createResponse = await this.client.videos.create({ model: modelToUse, prompt, ...mergedOptions });
            console.log("Video generation started");

            let video = {...createResponse};

            // We have to wait until the client finishes creating the image
            while(video.status === "in_progress" || video.status === "queued") {
                video = await this.client.videos.retrieve(video.id);
                const progress = video.progress ?? 0;
                const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

                process.stdout.write(`\n${statusText}: ${progress.toFixed(1)}%`);

                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            
            process.stdout.write('\n');

            if (video.status === 'failed') {
                throw new Error('Video generation failed');
            }

            console.log('Video generation completed');

            console.log('Downloading video content...');

            const content = await this.client.videos.downloadContent(video.id);            

            const body = content.arrayBuffer();
            const buffer = Buffer.from(await body);            

            return { 
                rawResponse: createResponse, 
                output: {
                    content, 
                    buffer
                },
                error: "", 
                metadata: { 
                    model: modelToUse, 
                    requestId: createResponse.id 
                } 
            };
        } catch (err: any) {
            return { output: null, error: err?.message ?? String(err) };
        }
    }   
    
    async editVideo(prompt: string, videoRequestId: string, model?: string, options?: Partial<Partial<any>> | undefined): Promise<AIResponse<any>> {
        try {
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIVideoOptions>(model, options as any, ModelOptionKey.Video, ModelRole.Video);

            const createResponse = await this.client.videos.remix(videoRequestId, { prompt, ...mergedOptions });

            console.log(createResponse);
            console.log("Video generation started");

            let video = {...createResponse};

            // We have to wait until the client finishes creating the image
            while(video.status === "in_progress" || video.status === "queued") {
                video = await this.client.videos.retrieve(video.id);
                const progress = video.progress ?? 0;
                const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

                process.stdout.write(`\n${statusText}: ${progress.toFixed(1)}%`);

                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            
            process.stdout.write('\n');

            if (video.status === 'failed') {
                throw new Error('Video generation failed');
            }

            console.log('Video generation completed');

            console.log('Downloading video content...');

            const content = await this.client.videos.downloadContent(video.id);            

            const body = content.arrayBuffer();
            const buffer = Buffer.from(await body);            

            return { 
                rawResponse: createResponse, 
                output: {
                    content, 
                    buffer
                },
                error: "", 
                metadata: { 
                    model: modelToUse, 
                    requestId: createResponse.id 
                } 
            };
        } catch (err: any) {
            return { output: null, error: err?.message ?? String(err) };
        }
    }

    async moderate(content: string | string[], model?: string, options?: Partial<Partial<any>> | undefined): Promise<AIResponse<any>> {
        try {
            // Use same transcription endpoint with translate flag depending on support
            const { modelToUse, mergedOptions } = this.prepareModelOptions<OpenAIAudioOptions>(model, options as any, ModelOptionKey.Moderation, ModelRole.Moderation);

            const response = await this.client.moderations.create({
                model: modelToUse,
                input: content,
                ...mergedOptions
            });

            return { 
                rawResponse: response, 
                output: response.text ?? "", 
                error: "", 
                metadata: { 
                    model: modelToUse, 
                    requestId: 
                    response.id 
                } 
            };
        } catch (err: any) {
            return { output: "", error: err?.message ?? String(err) };
        }                
    }    
}