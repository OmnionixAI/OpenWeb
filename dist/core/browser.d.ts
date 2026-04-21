import type { FetchedPage } from "../types/index.js";
import type { RuntimeConfig } from "../types/index.js";
export declare class BrowserService {
    private readonly config;
    constructor(config: RuntimeConfig);
    fetchPage(url: string): Promise<FetchedPage>;
    screenshot(url: string, outputPath: string): Promise<string>;
}
