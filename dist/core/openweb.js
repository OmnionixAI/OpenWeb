import { DiskBackedCache } from "./cache.js";
import { SearchService } from "./search.js";
import { BrowserService } from "./browser.js";
import { AiEngine } from "./ai-engine.js";
export class OpenWeb {
    config;
    cache;
    search;
    browser;
    ai;
    constructor(config) {
        this.config = config;
        this.cache = new DiskBackedCache(config.cache.ttlSeconds * 1000, config.cache.maxEntries);
        this.search = new SearchService(config);
        this.browser = new BrowserService(config);
        this.ai = new AiEngine(config);
    }
    async init() {
        if (this.config.cache.enabled) {
            await this.cache.load();
        }
    }
    async answerQuery(query) {
        const cacheKey = `query:${query}`;
        if (this.config.cache.enabled) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return { ...cached, fromCache: true };
            }
        }
        const sources = await this.search.search(query);
        const answer = await this.ai.answerWithSources(query, sources);
        const result = {
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
    async summarizeUrl(url) {
        const page = await this.browser.fetchPage(url);
        return this.ai.summarizeText(page.text);
    }
}
//# sourceMappingURL=openweb.js.map