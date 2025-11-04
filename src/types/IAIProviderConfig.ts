/**
 * ProviderConfig defines the initialization options
 * passed into each AI provider during setup.
 *
 */
export interface IAIProviderConfig {

    /**
     * The name of the provider (ie: "openai", "anthropic", etc.)
     */
    name: string;

    /**
     * The API key used to authenticate with the provider
     */
    apiKey?: string;

    /**
     * Optional additional fields depending on the provider
     */
    providerOptions?: Record<string, any>;
}