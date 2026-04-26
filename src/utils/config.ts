import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { APP_DIR, DEFAULT_CACHE_FILE, DEFAULT_CONFIG_FILE, DEFAULT_HISTORY_FILE } from "./constants.js";
import type { RuntimeConfig } from "../types/index.js";

const configSchema = z.object({
  output: z.object({
    color: z.boolean(),
    markdown: z.boolean(),
    json: z.boolean()
  }),
  browser: z.object({
    headless: z.boolean(),
    timeoutMs: z.number().int().positive(),
    userAgent: z.string().min(1)
  }),
  search: z.object({
    maxResults: z.number().int().positive(),
    provider: z.literal("duckduckgo")
  }),
  ai: z.object({
    enabled: z.boolean(),
    modelId: z.string().min(1),
    maxTokens: z.number().int().positive(),
    temperature: z.number().min(0).max(2)
  }),
  cache: z.object({
    enabled: z.boolean(),
    ttlSeconds: z.number().int().positive(),
    maxEntries: z.number().int().positive()
  }),
  history: z.object({
    enabled: z.boolean(),
    maxEntries: z.number().int().positive()
  })
});

export const defaultConfig: RuntimeConfig = {
  output: {
    color: true,
    markdown: true,
    json: false
  },
  browser: {
    headless: true,
    timeoutMs: 20000,
    userAgent: "OpenWeb/0.1 (+https://github.com/OmnionixAI/openweb)"
  },
  search: {
    maxResults: 6,
    provider: "duckduckgo"
  },
  ai: {
    enabled: true,
    modelId: "Qwen/Qwen3.5-2B",
    maxTokens: 512,
    temperature: 0.2
  },
  cache: {
    enabled: true,
    ttlSeconds: 3600,
    maxEntries: 500
  },
  history: {
    enabled: true,
    maxEntries: 200
  }
};

export function getAppHome(): string {
  return join(homedir(), APP_DIR);
}

export function getConfigPath(): string {
  return join(getAppHome(), DEFAULT_CONFIG_FILE);
}

export function getHistoryPath(): string {
  return join(getAppHome(), DEFAULT_HISTORY_FILE);
}

export function getCachePath(): string {
  return join(getAppHome(), DEFAULT_CACHE_FILE);
}

export async function ensureAppHome(): Promise<void> {
  await mkdir(getAppHome(), { recursive: true });
}

export async function loadConfig(): Promise<RuntimeConfig> {
  await ensureAppHome();
  const path = getConfigPath();
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    return configSchema.parse({
      ...defaultConfig,
      ...parsed,
      output: { ...defaultConfig.output, ...parsed.output },
      browser: { ...defaultConfig.browser, ...parsed.browser },
      search: { ...defaultConfig.search, ...parsed.search },
      ai: { ...defaultConfig.ai, ...parsed.ai },
      cache: { ...defaultConfig.cache, ...parsed.cache },
      history: { ...defaultConfig.history, ...parsed.history }
    });
  } catch {
    await saveConfig(defaultConfig);
    return defaultConfig;
  }
}

export async function saveConfig(config: RuntimeConfig): Promise<void> {
  await ensureAppHome();
  await writeFile(getConfigPath(), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export async function setConfigValue(path: string, value: unknown): Promise<RuntimeConfig> {
  const config = await loadConfig();
  const segments = path.split(".");
  let current: Record<string, unknown> = config as unknown as Record<string, unknown>;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]!;
    current[segment] ??= {};
    current = current[segment] as Record<string, unknown>;
  }
  current[segments.at(-1)!] = value;
  const validated = configSchema.parse(config);
  await saveConfig(validated);
  return validated;
}
