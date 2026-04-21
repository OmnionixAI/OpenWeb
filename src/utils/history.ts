import { readFile, writeFile } from "node:fs/promises";
import { getHistoryPath } from "./config.js";

export interface HistoryEntry {
  command: string;
  timestamp: string;
}

export async function recordHistory(command: string, maxEntries: number): Promise<void> {
  const existing = await readHistory();
  existing.unshift({ command, timestamp: new Date().toISOString() });
  await writeFile(getHistoryPath(), `${JSON.stringify(existing.slice(0, maxEntries), null, 2)}\n`, "utf8");
}

export async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await readFile(getHistoryPath(), "utf8");
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}
