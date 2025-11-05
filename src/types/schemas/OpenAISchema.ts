import { z } from "zod";
import { BaseGenOptionsSchema, BaseProviderConfigSchema, BaseProviderModelSchema } from "./BaseSchema";

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
 * OpenAI-specific schema
 * Each model entry has its own options and optional genOptions.
 */
export const OpenAIModelConfigSchema = BaseProviderModelSchema.extend({
    genOptions: OpenAIGenOptionsSchema.optional()
});

/**
 * OpenAI-specific providerOptions for per model configurations
 */
export const OpenAIProviderOptionsSchema = z.object({
    defaultModel: z.string(),

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
