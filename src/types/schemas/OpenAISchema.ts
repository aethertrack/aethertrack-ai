import { z } from "zod";
import { BaseEmbedOptionsSchema, BaseGenOptionsSchema, BaseImageOptionsSchema, BaseModelSchema, BaseProviderConfigSchema } from "./BaseSchema";

/**
 * OpenAI-specific per model generation options 
 */
export const OpenAIGenOptionsSchema = BaseGenOptionsSchema.extend({
    temperature: z.number().min(0).max(2).optional(),
    max_output_tokens: z.number().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
});

/**
 * OpenAI-specific embedding options
 */
export const OpenAIEmbedOptionsSchema = BaseEmbedOptionsSchema.extend({
    encodingFormat: z.enum(["float", "base64"]).optional(),
    dimensions: z.number().optional(),
});

/**
 * OpenAI-specific image generation options
 */
export const OpenAIImageOptionsSchema = BaseImageOptionsSchema.extend({
    size: z.enum(["256x256", "512x512", "1024x1024"]).optional(),
    quality: z.enum(["standard", "hd"]).optional(),
});

/**
 * OpenAI per-model schema — supports gen, embed, and image options.
 */
export const OpenAIModelConfigSchema = BaseModelSchema.extend({
    genOptions: OpenAIGenOptionsSchema.optional(),
    embedOptions: OpenAIEmbedOptionsSchema.optional(),
    imageOptions: OpenAIImageOptionsSchema.optional(),
});

/**
 * OpenAI-specific providerOptions for per model configurations
 */
export const OpenAIProviderOptionsSchema = z.object({
    // Map of model name → per-model config
    models: z.record(z.string(), OpenAIModelConfigSchema),
});

/**
 * OpenAI-specific schema
 * Adds provider-specific defaults and options supporting multiple models
 */
export const OpenAIProviderSchema = BaseProviderConfigSchema.extend({
    name: z.string().default("openai"),
    apiKey: z.string().optional(), // This will be loaded from .env file
    providerOptions: OpenAIProviderOptionsSchema,
});

export type OpenAIProviderConfig = z.infer<typeof OpenAIProviderSchema>;
