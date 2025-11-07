import { z } from "zod";

/**
 * Base schema for AI generation options.
 * Intentionally left minimal.
 * Optional; provider-specific fields can extend this
 */
export const BaseGenOptionsSchema = z.object({}).catchall(z.any());
export const BaseEmbedOptionsSchema = z.object({}).catchall(z.any());
export const BaseImageOptionsSchema = z.object({}).catchall(z.any());

/** 
 * Shared model config structure every provider can reuse 
 */
export const BaseModelSchema = z.object({    
    // Optional human-readable description of the provider
    description: z.string().optional(),

    // Optional flag to mark provider or configuration as deprecated
    deprecated: z.boolean().optional(),  

    // Name of the model
    modelName: z.string(),

    genOptions: BaseGenOptionsSchema.optional(),
    embedOptions: BaseEmbedOptionsSchema.optional(),
    imageOptions: BaseImageOptionsSchema.optional(),  
});

/**
 * Base schema for provider config
 * Includes name and optional apiKey
 */
export const BaseProviderConfigSchema = z
    .object({
        name: z.string(),
        apiKey: z.string().optional(),
        // Placeholder for provider-specific options
        // Will be overriden by specific provider schemas
        providerOptions: z.object({
            models: z.record(z.string(), BaseModelSchema),
        }),            
    });

export type BaseProviderConfig = z.infer<typeof BaseProviderConfigSchema>;    