import { AIProviderType } from "./IProvider";

/**
 * Base configuration interface for AI providers and per model options.
 */
export interface IModelConfig<
    TChatOptions extends Record<string, any> = Record<string, any>,
    TCompletionOptions extends Record<string, any> = Record<string, any>,
    TStreamOptions extends Record<string, any> = Record<string, any>,
    TEmbedOptions extends Record<string, any> = Record<string, any>,        
    TImageOptions extends Record<string, any> = Record<string, any>,
    TAudioOptions extends Record<string, any> = Record<string, any>    
> {
    chatOptions?: TChatOptions;
    streamOptions?: TStreamOptions;
    completionOptions?: TCompletionOptions;    
    embedOptions?: TEmbedOptions;
    imageOptions?: TImageOptions;
    audioOptions?: TAudioOptions;
}

/**
 * Base configuration interface for AI providers including name, apiKey and per model configs
 */
export interface IProviderConfig<TModel extends IModelConfig = IModelConfig> {
    name: AIProviderType;
    apiKey?: string;
    defaultModel: string;
    providerConfigOptions?: Record<string, any>;
    models: Record<string, TModel>;
    [key: string]: any;
}

/**
 * Top level config interface for the application including default provider and all provider configs
 */
export interface IAppConfig<IProviders extends Record<string, any>> {
    appConfig?: Record<string, any>;
    defaultProvider: keyof IProviders & string;
    providers: IProviders;
    [key: string]: any;
}

/**
 * Enumeration of model option keys for merging configurations
 */
export enum ModelOptionKey {
    chatOptions = "chatOptions",
    Completion = "completionOptions",
    Stream = "streamOptions",
    Embed = "embedOptions",
    Image = "imageOptions",
    Audio = "audioOptions",
}