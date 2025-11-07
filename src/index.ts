import dotenv from 'dotenv';
import { loadAppConfig } from "./config/ConfigLoader";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AppConfig } from './types/schemas/AppConfigSchema';
import { IAIProvider } from './types/IAIProvider';

async function main() {    
    console.log("Starting AetherTrack AI application...");

    dotenv.config(); // load .env variables
    
    const appConfig: AppConfig = loadAppConfig();

    console.log(`Configuration loaded for environment: ${process.env.NODE_ENV || 'development'}`);
    
    const provider:IAIProvider = new OpenAIProvider();
    await provider.init(appConfig.providers["openai"]);

  // Create embeddings
  const vectors = await provider.embed("quantum entanglement", "text-embedding-3-large");
  console.log("Embedding vector length:", vectors[0].length);    
  console.log("Embedding vectors:", JSON.stringify(vectors[0], null, 2));   
/*
    const text = await provider.generateText(
        "Explain polymorphism in OOP", 
        appConfig.providers["openai"].providerOptions.models["gpt-5"].modelName);

    console.log("texxt", text);*/
}

main().catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
});
