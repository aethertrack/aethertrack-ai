# AetherTrack AI

Lightweight TypeScript framework for working with multiple LLM providers via a plugin-style registry. Current providers: OpenAI and Anthropic. Configuration is file-based (node-config) with optional environment overrides for secrets.

## Features
- Pluggable provider registry (lazy load providers)
- Per-provider, per-model configuration (gen/embed/stream options)
- Simple unified provider interface (init, generateText, stream, embed)
- Config loaded from `config/default.json` + `.env` (dotenv)

## Getting started

Prerequisites
- Node.js 18+ (or compatible)
- npm

Install and run
```bash
npm install
npm run build        # compile TypeScript to dist/
npm run start        # run built app
# or for local development (watches src/ and rebuilds)
npm run dev
```

## Configuration

Primary configuration is `config/default.json`. Example (excerpt):
```json
{
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "name": "openai",
      "defaultModel": "gpt-5",
      "models": { ... }
    },
    "anthropic": {
      "name": "anthropic",
      "defaultModel": "claude-sonnet-4-5-20250929",
      "models": { ... }
    }
  }
}
```

Secrets (API keys) are read from environment variables. By convention the loader looks for:
- OPENAI_API_KEY
- ANTHROPIC_API_KEY

Use a local `.env` file for development (the loader calls `dotenv.config()` automatically):
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

Security note: Do not commit `.env` with real keys to git. Keep `.env.example` in the repo and rotate any leaked keys.

## Core concepts

- ProviderRegistry (src/providers/ProviderRegistry.ts)
  - registerProvider(name, factory): register a lazy factory that returns an IProvider instance
  - createProvider(name, config): instantiate a provider via its factory
  - listProviders/hasProvider/unregisterProvider helpers are available

- IProvider (src/types/IProvider.ts)
  - type: provider identifier
  - init(config): setup client + credentials
  - generateText(prompt, model?, options?)
  - stream(prompt, onChunk, model?, options?)
  - embed(prompt, model?, options?)

- Config types (src/types/BaseConfigs.ts)
  - IModelConfig: per-model gen/embed/stream defaults
  - IProviderConfig: per-provider config, apiKey optional (can be injected from env)
  - IAppConfig: top-level app config

## How to add a new provider
1. Implement IProvider for the provider (init, generateText, etc.).
2. Register it in startup code with ProviderRegistry.registerProvider("name", async (cfg) => { ...init...; return instance; }).
3. Add provider config to `config/default.json` and provide API key via env or config.

## Project layout
- src/
  - config/ConfigLoader.ts — loads node-config + dotenv and validates providers
  - providers/ProviderRegistry.ts — plugin-style registry
  - providers/OpenAIProvider.ts — OpenAI implementation
  - providers/AnthropicProvider.ts — Anthropic implementation
  - types/ — config and provider interfaces
  - index.ts — example application entrypoint that registers providers and exercises them

## Example usage (high level)
```ts
const appConfig = loadAppConfig();
registerProviders(); // app-specific registration
const provider = await ProviderRegistry.createProvider(appConfig.defaultProvider, appConfig.providers[appConfig.defaultProvider]);
const result = await provider.generateText("Write a haiku about lazy loading.");
console.log(result);
```

## Development notes & suggestions
- Keep API keys out of the repository; use `.env` in local dev and CI secrets in production.
- The config loader already injects env API keys when provider.apiKey is missing.
- Providers merge per-model defaults with call-time options; prefer explicit option names that match each provider's SDK.

## Contributing
PRs welcome. Follow existing code style and add unit tests where appropriate.

## License
MIT