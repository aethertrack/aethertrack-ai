import { AIProviderType } from "./IProvider.js";

/**
 * Base configuration interface for AI providers and per model options.
 */
export interface IModelConfig<
    TChatOptions extends Record<string, any> = Record<string, any>,
    TCompletionOptions extends Record<string, any> = Record<string, any>,
    TStreamOptions extends Record<string, any> = Record<string, any>,
    TEmbedOptions extends Record<string, any> = Record<string, any>,        
    TImageOptions extends Record<string, any> = Record<string, any>,
    TAudioOptions extends Record<string, any> = Record<string, any>,    
    TVideoOptions extends Record<string, any> = Record<string, any>,
    TModerationOptions extends Record<string, any> = Record<string, any>  
> {
    roles: ModelRole[];
    chatOptions?: TChatOptions;
    streamOptions?: TStreamOptions;
    completionOptions?: TCompletionOptions;    
    embedOptions?: TEmbedOptions;
    imageOptions?: TImageOptions;
    audioOptions?: TAudioOptions;
    videoOptions?: TVideoOptions;
    moderationOptions?: TModerationOptions;
}

/**
 * Base configuration interface for AI providers including name, apiKey and per model configs
 */
export interface IProviderConfig<TModel extends IModelConfig = IModelConfig> {
    type: AIProviderType;
    apiKeyEnvVar?: string;
    apiKey?: string;
    defaultModel?: string;
    providerConfigOptions?: Record<string, any>;
    models: Record<string, TModel>;
    [key: string]: any;
}

/**
 * Top level config interface for the application including default provider and all provider configs
 */
export interface IAppConfig<IProviders extends Record<string, any>> {
    appConfig?: Record<string, any>;
    providers: IProviders;
}

/**
 * Enumeration of model types / roles
 */
export enum ModelRole {
    Chat = "chat",
    Completion = "completion",
    Embed = "embed",
    Image = "image",
    Audio = "audio",
    Stream = "stream",
    Video = "video",
    Moderation = "moderation"
}

/**
 * Enumeration of model option keys for merging configurations
 */
export enum ModelOptionKey {
    ChatOptions = "chatOptions",
    Completion = "completionOptions",
    Stream = "streamOptions",
    Embed = "embedOptions",
    Image = "imageOptions",
    Audio = "audioOptions",
    Video = "videoOptions",
    Moderation = "moderationOptions",
}