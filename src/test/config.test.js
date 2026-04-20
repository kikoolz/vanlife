import { describe, it, expect } from "vitest";
import { config, getEnvironment } from "../config";

describe("Config", () => {
  describe("config object structure", () => {
    it("should have the correct structure", () => {
      expect(config).toHaveProperty("supabase");
      expect(config).toHaveProperty("stripe");
      expect(config).toHaveProperty("api");
      expect(config).toHaveProperty("app");
      expect(config).toHaveProperty("features");
    });

    it("should have supabase config properties", () => {
      expect(config.supabase).toHaveProperty("url");
      expect(config.supabase).toHaveProperty("anonKey");
    });

    it("should have stripe config properties", () => {
      expect(config.stripe).toHaveProperty("publishableKey");
    });

    it("should have app config properties", () => {
      expect(config.app).toHaveProperty("url");
      expect(config.app).toHaveProperty("environment");
    });

    it("should have features config properties", () => {
      expect(config.features).toHaveProperty("analytics");
      expect(config.features).toHaveProperty("errorTracking");
    });
  });

  describe("getEnvironment", () => {
    it("should return environment info object", () => {
      const env = getEnvironment();
      expect(env).toHaveProperty("name");
      expect(env).toHaveProperty("isDevelopment");
      expect(env).toHaveProperty("isProduction");
      expect(env).toHaveProperty("isStaging");
    });
  });
});
