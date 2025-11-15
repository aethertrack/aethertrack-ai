import { InferenceClient } from "@huggingface/inference";
import { IModelConfig, IProviderConfig } from "../../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../../types/IProvider.js";
/*
export class HuggingFaceProvider implements IProvider<IProviderConfig> {
    type: AIProviderType = AIProviderType.HuggingFace;

    private client: InferenceClient | null = null;
    private config: IProviderConfig | null = null;

    async init(config: IProviderConfig): Promise<void> {
        // Initialization logic for Hugging Face provider
        if (!config.apiKey) {
            throw new Error("HuggingFace API key required but not found in config. Check .env file");
        }
        this.client = new InferenceClient(config.apiKey);
        this.config = config;
    }

    async generateText(
        prompt: string,
        model?: string,
        options?: Partial<IModelConfig["genTextOptions"]>): Promise<any> {

        // make sure the provider is initialized and ready
        if (!this.client || !this.config) {
            throw new Error("Provider not initialized");
        }

        // If model is not provided, use defaultModel from config
        const modelToUse: string = model || this.config.defaultModel;
        const modelConfig: IModelConfig = this.config.models[modelToUse];
        if (!modelConfig) {
            throw new Error(`Model ${modelToUse} not found`);
        }
        try {

            const response = await this.client.chatCompletion({
                model: "meta-llama/Llama-3.1-8B-Instruct",
                provider: "sambanova", // or together, fal-ai, replicate, cohere …
                messages: [
                    {
                        role: "user",
                        content: "Hello, nice to meet you!",
                    },
                ],
                max_tokens: 512,
                temperature: 0.5,
            });
 
            return response;
        } catch (err) {
            console.log("Error generating text:", (err as any));
            throw err;
        }
    }
}
*/