import { readFile, writeFile } from "node:fs/promises";
import { getHistoryPath } from "./config.js";
export async function recordHistory(command, maxEntries) {
    const existing = await readHistory();
    existing.unshift({ command, timestamp: new Date().toISOString() });
    await writeFile(getHistoryPath(), `${JSON.stringify(existing.slice(0, maxEntries), null, 2)}\n`, "utf8");
}
export async function readHistory() {
    try {
        const raw = await readFile(getHistoryPath(), "utf8");
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=history.js.map