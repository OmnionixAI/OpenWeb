export declare class DiskBackedCache<T> {
    private readonly ttlMs;
    private readonly memory;
    constructor(ttlMs: number, maxEntries: number);
    load(): Promise<void>;
    get(key: string): T | undefined;
    set(key: string, value: T): Promise<void>;
    clear(): Promise<void>;
    flush(): Promise<void>;
}
