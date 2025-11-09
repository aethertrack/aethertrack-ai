import dotenv from "dotenv";
import { IAppConfig, IProviderConfig } from "./types/BaseConfigs.js";
import { loadAppConfig } from "./config/ConfigLoader.js";
import { ProviderRegistry } from "./providers/ProviderRegistry.js";
import { IProvider } from "./types/IProvider.js";

function registerProviders() {
    // Lazy load OpenAI
    ProviderRegistry.registerProvider("openai", async (config:IProviderConfig) => {
        console.log("Loading OpenAI provider module...");
        const { OpenAIProvider } = await import("./providers/OpenAIProvider.js");
        const openAi = new OpenAIProvider();
        await openAi.init(config);
        return openAi;
    });

    // Lazy load Anthropic
    ProviderRegistry.registerProvider("anthropic", async (config:IProviderConfig) => {
        console.log("Loading AnthropicProvider provider module...");
        const { AnthropicProvider } = await import("./providers/AnthropicProvider.js");
        const anthropic = new AnthropicProvider();
        await anthropic.init(config);
        return anthropic;
    });    
}

async function main() {
    console.log("Starting AetherTrack AI application...");    
    
    const appConfig: IAppConfig<any> = loadAppConfig();

    console.log(`Configuration loaded for environment: ${process.env.NODE_ENV || 'development'}`);

    console.log(appConfig);

    console.log("Registering providers...");
    registerProviders();

    const providerName = appConfig.defaultProvider;
    const providerConfig = appConfig.providers[providerName];

    console.log(`Loading provider: ${providerName}`);
    const provider:IProvider = await ProviderRegistry.createProvider(providerName, providerConfig);

    if(!provider || !provider.generateText) {
        throw new Error(`Failed to create provider: ${providerName}`);
    }



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

    const anthropicProviderConfig = appConfig.providers["anthropic"];
    const anthropic:IProvider = await ProviderRegistry.createProvider("anthropic", anthropicProviderConfig);

    if(!anthropic || !anthropic.generateText) {
        throw new Error(`Failed to create provider: anthropic`);
    }

    //console.log("Generated response from OpenAI:");
    //console.log(response);

    /*const anthropicProvider:AnthropicProvider = new AnthropicProvider();
    await anthropicProvider.init(appConfig.providers.anthropic);
*/
    const response: any = await anthropic.generateText("Hello world!, How are you?");

    /*let resultString: string = "";
    const response: any = await anthropicProvider.stream("Hello world!, How are you?", (chunk) => {        
        resultString += chunk?.delta?.text || "";
    });*/

    console.log("Generated response from Anthropic:");
    console.log(response);

    console.log("---------------");
}

main().catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
});
