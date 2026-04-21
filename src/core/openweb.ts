import type { QueryAnswer, RuntimeConfig } from "../types/index.js";
import { DiskBackedCache } from "./cache.js";
import { SearchService } from "./search.js";
import { BrowserService } from "./browser.js";
import { AiEngine } from "./ai-engine.js";

export class OpenWeb {
  readonly cache: DiskBackedCache<QueryAnswer>;
  readonly search: SearchService;
  readonly browser: BrowserService;
  readonly ai: AiEngine;

  constructor(private readonly config: RuntimeConfig) {
    this.cache = new DiskBackedCache<QueryAnswer>(config.cache.ttlSeconds * 1000, config.cache.maxEntries);
    this.search = new SearchService(config);
    this.browser = new BrowserService(config);
    this.ai = new AiEngine(config);
  }

  async init(): Promise<void> {
    if (this.config.cache.enabled) {
      await this.cache.load();
    }
  }

  async answerQuery(query: string): Promise<QueryAnswer> {
    const cacheKey = `query:${query}`;
    if (this.config.cache.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    const sources = await this.search.search(query);
    const answer = await this.ai.answerWithSources(query, sources);
    const result: QueryAnswer = {
      query,
      answer,
      sources,
      fromCache: false
    };

    if (this.config.cache.enabled) {
      await this.cache.set(cacheKey, result);
    }

    return result;
  }

  async summarizeUrl(url: string): Promise<string> {
    const page = await this.browser.fetchPage(url);
    return this.ai.summarizeText(page.text);
  }
}
