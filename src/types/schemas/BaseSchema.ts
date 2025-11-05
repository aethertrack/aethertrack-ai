import { z } from "zod";

/**
 * Base schema for AI generation options.
 * Intentionally left minimal.
 * Optional; provider-specific fields can extend this
 */
export const BaseGenOptionsSchema = z.object({ });

/**
 * Base schema for provider options
 * Supports multi model configs per provider via derived schemas
 */
export const BaseProviderModelSchema = z
    .object({
        // Optional human-readable description of the provider
        description: z.string().optional(),

        // Optional flag to mark provider or configuration as deprecated
        deprecated: z.boolean().optional(),
    });

/**
 * Base schema for provider config
 * Includes name and optional apiKey
 */
export const BaseProviderConfigSchema = z
    .object({
        name: z.string(),
        apiKey: z.string().optional(),
        // Placeholder for provider-specific options (defaultModel, models, etc.)
        // Will be overriden by specific provider schemas
        providerOptions: z.record(z.any(), z.any()),        
    });

export type BaseProviderConfig = z.infer<typeof BaseProviderConfigSchema>;    