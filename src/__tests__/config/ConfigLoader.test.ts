import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { loadAppConfig } from "../../config/ConfigLoader.js";

describe("ConfigLoader", () => {
    beforeEach(() => {
    });

    afterEach(() => {
    });

    it("loads default config and injects API keys from env when missing", () => {
        process.env.OPENAI_API_KEY = "openai-test-key";
        process.env.ANTHROPIC_API_KEY = "anthropic-test-key";

        const cfg = loadAppConfig();

        expect(cfg).toBeDefined();
        expect(cfg.defaultProvider).toBe("openai");
        expect(typeof cfg.providers).toBe("object");
        expect(cfg.providers.openai).toBeDefined();
        expect(cfg.providers.anthropic).toBeDefined();

        // env injection
        expect(cfg.providers.openai.apiKey).toBe("openai-test-key");
        expect(cfg.providers.anthropic.apiKey).toBe("anthropic-test-key");
    });

    it("ensures providers have models", () => {
        const cfg = loadAppConfig();
        expect(Object.keys(cfg.providers.openai.models).length).toBeGreaterThan(0);
    });
});