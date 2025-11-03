import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Environment Variables Loaded:");
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY}`);
}

main().catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
});
