/**
 * ProviderConfig defines the initialization options
 * passed into each AI provider during setup.
 *
 * Note: The `[k: string]: any` allows provider-specific
 * configuration without changing the shared interface
 */
export interface IAIProviderConfig {
  /**
   * The API key used to authenticate with the provider.
   */
  apiKey?: string;

  /**
   * Optional additional fields depending on the provider.
   */
  [field: string]: any;
}