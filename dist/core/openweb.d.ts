import type { QueryAnswer, RuntimeConfig } from "../types/index.js";
import { DiskBackedCache } from "./cache.js";
import { SearchService } from "./search.js";
import { BrowserService } from "./browser.js";
import { AiEngine } from "./ai-engine.js";
export declare class OpenWeb {
    private readonly config;
    readonly cache: DiskBackedCache<QueryAnswer>;
    readonly search: SearchService;
    readonly browser: BrowserService;
    readonly ai: AiEngine;
    constructor(config: RuntimeConfig);
    init(): Promise<void>;
    answerQuery(query: string): Promise<QueryAnswer>;
    summarizeUrl(url: string): Promise<string>;
}
