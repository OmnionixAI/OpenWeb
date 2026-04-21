import { readFile, writeFile } from "node:fs/promises";
import { LRUCache } from "lru-cache";
import { getCachePath } from "../utils/config.js";

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export class DiskBackedCache<T> {
  private readonly memory: LRUCache<string, CacheEntry<T>>;

  constructor(
    private readonly ttlMs: number,
    maxEntries: number
  ) {
    this.memory = new LRUCache({ max: maxEntries });
  }

  async load(): Promise<void> {
    try {
      const raw = await readFile(getCachePath(), "utf8");
      const data = JSON.parse(raw) as Record<string, CacheEntry<T>>;
      for (const [key, value] of Object.entries(data)) {
        this.memory.set(key, value);
      }
    } catch {
      return;
    }
  }

  get(key: string): T | undefined {
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

  async set(key: string, value: T): Promise<void> {
    this.memory.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });
    await this.flush();
  }

  async clear(): Promise<void> {
    this.memory.clear();
    await this.flush();
  }

  async flush(): Promise<void> {
    const serialized = Object.fromEntries(this.memory.entries());
    await writeFile(getCachePath(), `${JSON.stringify(serialized, null, 2)}\n`, "utf8");
  }
}
