import type { QueryAnswer, SearchResult } from "../types/index.js";
export declare function renderMarkdown(markdown: string): string;
export declare function formatAnswer(answer: QueryAnswer): string;
export declare function formatSearchResults(results: SearchResult[]): string;
export declare function formatLinks(links: Array<{
    text: string;
    href: string;
}>): string;
