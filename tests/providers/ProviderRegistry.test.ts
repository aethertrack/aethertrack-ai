import { ProviderRegistry } from "../../src/providers/ProviderRegistry.js";
import { IProvider } from "../../src/types/IProvider.js";

describe("ProviderRegistry", () => {
    beforeEach(() => {
        // ensure clean registry by unregistering a known key if present
        ProviderRegistry.unregisterProvider("dummy");
    });

    it("registers, creates, lists, checks and unregisters providers", async () => {
        const factory = async (cfg: any): Promise<IProvider> => ({
            type: ({} as any),
            init: async () => { },
            generateText: async () => "ok",
        } as IProvider);

        ProviderRegistry.registerProvider("dummy", factory);

        expect(ProviderRegistry.hasProvider("dummy")).toBe(true);
        expect(ProviderRegistry.listProviders()).toContain("dummy");

        const provider = await ProviderRegistry.createProvider("dummy", { name: "dummy", defaultModel: "m", models: {} } as any);
        expect(provider).toBeDefined();
        expect(typeof provider.generateText).toBe("function");

        const unreg = ProviderRegistry.unregisterProvider("dummy");
        expect(unreg).toBe(true);
        expect(ProviderRegistry.hasProvider("dummy")).toBe(false);
    });

    it("throws when creating unregistered provider", async () => {
        await expect(ProviderRegistry.createProvider("not-registered", { name: "x", defaultModel: "m", models: {} } as any)).rejects.toThrow();
    });
});