import { z } from "zod";
import { OpenAIProviderSchema } from "./OpenAISchema";
import { BaseProviderConfigSchema } from "./BaseSchema";

/**
 * Top-level app config schema
 */
export const AppConfigSchema = z.object({
    defaultProvider: z.string(),
    // List of providers, each validated by its provider-specific schema
    providers: z.record(z.string(), BaseProviderConfigSchema),   
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export const providerSchemaMap: Record<string, z.ZodTypeAny> = {
    openai: OpenAIProviderSchema,
    // anthropic: AnthropicProviderSchema,
    // huggingface: HuggingFaceProviderSchema,
};