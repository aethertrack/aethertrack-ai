import dotenv from "dotenv";
import { IAppConfig, IProviderConfig } from "./types/BaseConfigs.js";
import { loadAppConfig } from "./config/ConfigLoader.js";
import { ProviderRegistry } from "./providers/ProviderRegistry.js";
import { AIProviderType, IProvider } from "./types/IProvider.js";
import { ProviderManager } from "./providers/ProviderManager.js";

function registerProviders() {
    // Lazy load OpenAI
    ProviderRegistry.registerProvider(AIProviderType.OpenAI, async (config:IProviderConfig) => {
        console.log(`Loading provider module for provider: ${AIProviderType.OpenAI}`);
        const { OpenAIProvider } = await import("./providers/openai/OpenAIProvider.js");
        const openAi = new OpenAIProvider();
        await openAi.init(config);
        return openAi;
    });

    // Lazy load Anthropic
  /*  ProviderRegistry.registerProvider("anthropic", async (config:IProviderConfig) => {
        console.log(`Loading provider module for provider: ${AIProviderType.Anthropic}`);
        const { AnthropicProvider } = await import("./providers/AnthropicProvider.js");
        const anthropic = new AnthropicProvider();
        await anthropic.init(config);
        return anthropic;
    });    

    // Lazy load HuggingFace
    ProviderRegistry.registerProvider("huggingface", async (config:IProviderConfig) => {
        console.log(`Loading provider module for provider: ${AIProviderType.HuggingFace}`);
        const { HuggingFaceProvider } = await import("./providers/HuggingFaceProvider.js");
        const hfProvider = new HuggingFaceProvider();
        await hfProvider.init(config);
        return hfProvider;
    });   */  
}

async function main() {
    console.log("Starting AetherTrack AI application...");    
    
    const appConfig: IAppConfig<any> = loadAppConfig();

    console.log(`Configuration loaded for environment: ${process.env.NODE_ENV || 'development'}`);

    console.log("Registering providers...");
    
    registerProviders();

    console.log("Getting OpenAI provider instance...");

    const openai1 = await ProviderRegistry.createProvider(
        AIProviderType.OpenAI,
        appConfig.providers.openai.connection1
    );

    //console.log("openai1", JSON.stringify(openai1, null, 2));

    const result = await openai1.generateText!("hello from connection1");

    console.log(result);

    /*const openai1 = await ProviderManager.getProvider(AIProviderType.OpenAI, {
        name: AIProviderType.OpenAI,
        apiKey: process.env.OPENAI_API_KEY_1,
        defaultModel: "gpt-4",
        models: {
            "gpt-4": {},
        },
    }, "1");

    const result = await openai1.generateText!("Hello from key1");

    console.log(result);*/

    //const result = await provider.generateText("Write a haiku about lazy loading.");

    /*const providerName = appConfig.defaultProvider;
    const providerConfig = appConfig.providers[providerName];

    console.log(`Loading provider: ${providerName}`);
    const provider:IProvider = await ProviderRegistry.createProvider(providerName, providerConfig);

    if(!provider || !provider.generateText) {
        throw new Error(`Failed to create provider: ${providerName}`);
    }

*/

   // const result = await provider.generateText("Write a haiku about lazy loading.");

   // console.log(`[${providerName}]`, result);    

    //console.log(JSON.stringify(appConfig, null, 2));

   // const openaiProvider: OpenAIProvider = new OpenAIProvider();
   // await openaiProvider.init(appConfig.providers.openai);

  //  const prompt: string = "Once upon a time in a land far, far away, there lived a";
    //const response: any = await openaiProvider.generateText(prompt, "gpt-5");


    // streamed response
   /* let resultString: string = "";
    const response: any = await openaiProvider.stream(prompt, (str) => {
        resultString += str;
    },"gpt-5");
*/
  //  const response: any = await openaiProvider.embed("Hello world!", "text-embedding-3-large");

   /* const anthropicProviderConfig = appConfig.providers["anthropic"];
    const anthropic:IProvider = await ProviderRegistry.createProvider("anthropic", anthropicProviderConfig);

    if(!anthropic || !anthropic.generateText || !anthropic.stream) {
        throw new Error(`Failed to create provider: anthropic`);
    }*/

    //console.log("Generated response from OpenAI:");
    //console.log(response);

    /*const anthropicProvider:AnthropicProvider = new AnthropicProvider();
    await anthropicProvider.init(appConfig.providers.anthropic);
*/
    //const response: any = await anthropic.generateText("Hello world!, How are you?");

    /*let resultString: string = "";
    const response: any = await anthropic.stream("Hello world!, How are you?", (chunk) => {        
        resultString += chunk?.delta?.text || "";
    });

    console.log("Generated response from Anthropic:");
    console.log(resultString);*/

//-----------------hf
    /*const providerName = "huggingface";
    const providerConfig = appConfig.providers[providerName]
    const provider:IProvider = await ProviderRegistry.createProvider(providerName, providerConfig);

    if(!provider || !provider.generateText) {
        throw new Error(`Failed to create provider: ${providerName}`);
    }

    const result = await provider.generateText("Write a short story about a brave little toaster.");

    console.log(`Generated response from ${providerName}:`);
    console.log(JSON.stringify(result, null, 2));*/

    console.log("-------------------");
}

main().catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
});
