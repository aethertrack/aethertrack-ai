/**
 * Base configuration interface for AI providers and per model options.
 */
export interface IModelConfig<
    TGen extends Record<string, any> = Record<string, any>,
    TEmbed extends Record<string, any> = Record<string, any>,
    TStream extends Record<string, any> = Record<string, any>
> {
    genOptions?: TGen;
    embedOptions?: TEmbed;
    streamOptions?: TStream;
}

/**
 * Base configuration interface for AI providers including name, apiKey and per model configs
 */
export interface IProviderConfig<TModel extends IModelConfig = IModelConfig> {
    name: string;
    apiKey?: string;
    defaultModel: string;
    providerConfig?: Record<string, any>;
    models: Record<string, TModel>;
}

/**
 * Top level config interface for the application including default provider and all provider configs
 */
export interface IAppConfig<IProviders extends Record<string, any>> {
    appConfig?: Record<string, any>;
    defaultProvider: keyof IProviders & string;
    providers: IProviders;
}