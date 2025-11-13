import { SpeechCreateParams } from "openai/resources/audio/speech";
import { TranscriptionCreateParams } from "openai/resources/audio/transcriptions";
import {
    ChatCompletionCreateParams,
    CompletionCreateParams,
    EmbeddingCreateParams,
    ImageGenerateParams,
    ImageEditParams
} from "openai/resources";
import { IModelConfig, IProviderConfig } from "../../types/BaseConfigs";

/**
 * OpenAI-specific option types used by IProvider generics.
 * These map directly to OpenAI SDK parameters for clarity and type safety.
 */
export type OpenAIChatOptions = Partial<ChatCompletionCreateParams>;
export type OpenAIStreamOptions = Partial<ChatCompletionCreateParams>;
export type OpenAITextCompletionOptions = Partial<CompletionCreateParams>;
export type OpenAIEmbedOptions = Partial<EmbeddingCreateParams>;
export type OpenAIImageOptions = Partial<ImageGenerateParams & ImageEditParams>;
export type OpenAIAudioOptions = Partial<SpeechCreateParams & TranscriptionCreateParams>;

/**
 * Fully typed model configuration for OpenAI
 */
export interface OpenAIModelConfig extends IModelConfig<
    OpenAIChatOptions,
    OpenAIStreamOptions,
    OpenAITextCompletionOptions,    
    OpenAIEmbedOptions,
    OpenAIImageOptions,
    OpenAIAudioOptions
> {}