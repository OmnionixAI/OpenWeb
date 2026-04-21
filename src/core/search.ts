import * as cheerio from "cheerio";
import type { RuntimeConfig, SearchResult } from "../types/index.js";

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

export class SearchService {
  constructor(private readonly config: RuntimeConfig) {}

  async search(query: string): Promise<SearchResult[]> {
    const endpoint = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint, {
      headers: {
        "user-agent": this.config.browser.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`Search request failed with ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = $(".result")
      .slice(0, this.config.search.maxResults)
      .map((_, element) => {
        const title = $(element).find(".result__title").text().trim();
        const url = normalizeUrl($(element).find(".result__url").text().trim() || $(element).find("a.result__a").attr("href") || "");
        const snippet = $(element).find(".result__snippet").text().trim();
        return {
          title,
          url,
          snippet,
          source: "DuckDuckGo"
        } satisfies SearchResult;
      })
      .get()
      .filter((result) => result.title.length > 0 && result.url.length > 0);

    return results;
  }
}
