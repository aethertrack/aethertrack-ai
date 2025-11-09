import dotenv from "dotenv";
import { IAppConfig } from "./types/BaseConfigs";
import { loadAppConfig } from "./config/ConfigLoader";
import { OpenAIProvider } from "./providers/OpenAIProvider";

async function main() {
    console.log("Starting AetherTrack AI application...");

    dotenv.config(); // load .env variables
    
    const appConfig: IAppConfig<any> = loadAppConfig();

    console.log(`Configuration loaded for environment: ${process.env.NODE_ENV || 'development'}`);

    console.log(appConfig);
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

    //console.log("Generated response from OpenAI:");
    //console.log(response);

    //console.log("---------------");
}

main().catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
});
