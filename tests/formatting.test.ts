import { describe, expect, it } from "vitest";
import { formatAnswer } from "../src/utils/formatting.js";

describe("formatAnswer", () => {
  it("renders the query and source list", () => {
    const result = formatAnswer({
      query: "test",
      answer: "hello world",
      fromCache: false,
      sources: [
        { title: "Example", url: "https://example.com", snippet: "snippet", source: "Example" }
      ]
    });

    expect(result).toContain("Query: test");
    expect(result).toContain("Example");
  });
});
