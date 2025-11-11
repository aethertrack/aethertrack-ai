import { InferenceClient } from "@huggingface/inference"; 
import { IModelConfig, IProviderConfig } from "../types/BaseConfigs.js";
import { AIProviderType, IProvider } from "../types/IProvider.js";

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
        options?: Partial<IModelConfig["genOptions"]>): Promise<any> {

            
    }    
}
