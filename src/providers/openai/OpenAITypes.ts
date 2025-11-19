import { SpeechCreateParams } from "openai/resources/audio/speech";
import { TranscriptionCreateParams } from "openai/resources/audio/transcriptions";
import { TranslationCreateParams } from "openai/resources/audio/translations";
import {
    ChatCompletionCreateParams,
    CompletionCreateParams,
    EmbeddingCreateParams,
    ImageGenerateParams,
    ImageEditParams,
    VideoDownloadContentParams,
    VideoRemixParams,
    ModerationCreateParams
} from "openai/resources";
import { IModelConfig } from "../../types/BaseConfigs.js";


/**
 * OpenAI-specific option types used by IProvider generics.
 * These map directly to OpenAI SDK parameters for clarity and type safety.
 */
export type OpenAIChatOptions = Partial<ChatCompletionCreateParams>;
export type OpenAIStreamOptions = Partial<ChatCompletionCreateParams>;
export type OpenAITextCompletionOptions = Partial<CompletionCreateParams>;
export type OpenAIEmbedOptions = Partial<EmbeddingCreateParams>;
export type OpenAIImageOptions = Partial<ImageGenerateParams & ImageEditParams>;
export type OpenAIAudioOptions = Partial<SpeechCreateParams & TranscriptionCreateParams & TranslationCreateParams>;
export type OpenAIVideoOptions = Partial<VideoDownloadContentParams & VideoRemixParams>;
export type OpenAIModerationOptions = Partial<ModerationCreateParams>;

/**
 * Fully typed model configuration for OpenAI
 */
export interface OpenAIModelConfig extends IModelConfig<
    OpenAIChatOptions,
    OpenAIStreamOptions,
    OpenAITextCompletionOptions,    
    OpenAIEmbedOptions,
    OpenAIImageOptions,
    OpenAIAudioOptions,
    OpenAIVideoOptions,
    OpenAIModerationOptions
> {}