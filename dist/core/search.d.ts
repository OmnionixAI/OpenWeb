import type { RuntimeConfig, SearchResult } from "../types/index.js";
export declare class SearchService {
    private readonly config;
    constructor(config: RuntimeConfig);
    search(query: string): Promise<SearchResult[]>;
}
