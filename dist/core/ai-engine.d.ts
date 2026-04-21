import type { RuntimeConfig, SearchResult } from "../types/index.js";
export declare class AiEngine {
    private readonly config;
    private transformersPromise?;
    constructor(config: RuntimeConfig);
    private loadTransformers;
    summarizeText(text: string): Promise<string>;
    answerWithSources(query: string, sources: SearchResult[]): Promise<string>;
}
