import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/utils/config.js";

describe("defaultConfig", () => {
  it("uses duckduckgo as the search provider", () => {
    expect(defaultConfig.search.provider).toBe("duckduckgo");
  });

  it("ships with ai enabled", () => {
    expect(defaultConfig.ai.enabled).toBe(true);
  });
});
