import { readFile, writeFile } from "node:fs/promises";
import { LRUCache } from "lru-cache";
import { getCachePath } from "../utils/config.js";
export class DiskBackedCache {
    ttlMs;
    memory;
    constructor(ttlMs, maxEntries) {
        this.ttlMs = ttlMs;
        this.memory = new LRUCache({ max: maxEntries });
    }
    async load() {
        try {
            const raw = await readFile(getCachePath(), "utf8");
            const data = JSON.parse(raw);
            for (const [key, value] of Object.entries(data)) {
                this.memory.set(key, value);
            }
        }
        catch {
            return;
        }
    }
    get(key) {
        const entry = this.memory.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.memory.delete(key);
            return undefined;
        }
        return entry.value;
    }
    async set(key, value) {
        this.memory.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMs
        });
        await this.flush();
    }
    async clear() {
        this.memory.clear();
        await this.flush();
    }
    async flush() {
        const serialized = Object.fromEntries(this.memory.entries());
        await writeFile(getCachePath(), `${JSON.stringify(serialized, null, 2)}\n`, "utf8");
    }
}
//# sourceMappingURL=cache.js.map