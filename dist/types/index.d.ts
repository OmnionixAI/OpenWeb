export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
}
export interface FetchedPage {
    url: string;
    title: string;
    html: string;
    text: string;
    markdown: string;
    links: Array<{
        text: string;
        href: string;
    }>;
}
export interface QueryAnswer {
    query: string;
    answer: string;
    sources: SearchResult[];
    fromCache: boolean;
}
export interface RuntimeConfig {
    output: {
        color: boolean;
        markdown: boolean;
        json: boolean;
    };
    browser: {
        headless: boolean;
        timeoutMs: number;
        userAgent: string;
    };
    search: {
        maxResults: number;
        provider: "duckduckgo";
    };
    ai: {
        enabled: boolean;
        modelId: string;
        maxTokens: number;
        temperature: number;
    };
    cache: {
        enabled: boolean;
        ttlSeconds: number;
        maxEntries: number;
    };
    history: {
        enabled: boolean;
        maxEntries: number;
    };
}
