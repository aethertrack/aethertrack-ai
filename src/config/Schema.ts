import { z } from 'zod';
import type { IAIProviderConfig } from '../types/IAIProviderConfig';

export const ProviderOptionsSchema = z.record(z.any(), z.any()).optional();

export const ZAIProviderConfigSchema: z.ZodType<IAIProviderConfig> = z.object({
    name: z.string(),
    apiKey: z.string().optional(),
    providerOptions: ProviderOptionsSchema
});

export const AppConfigSchema = z.object({
    defaultProvider: z.string(),
    providers: z.array(ZAIProviderConfigSchema)
});

export type ProviderConfig = z.infer<typeof ZAIProviderConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
