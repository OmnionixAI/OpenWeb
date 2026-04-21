export interface HistoryEntry {
    command: string;
    timestamp: string;
}
export declare function recordHistory(command: string, maxEntries: number): Promise<void>;
export declare function readHistory(): Promise<HistoryEntry[]>;
