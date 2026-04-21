import chalk from "chalk";
import { marked } from "marked";
import { table } from "table";
export function renderMarkdown(markdown) {
    const html = marked.parse(markdown, { async: false });
    return String(html).replace(/<[^>]+>/g, "").trim();
}
export function formatAnswer(answer) {
    const lines = [
        chalk.cyan(`Query: ${answer.query}`),
        "",
        answer.answer.trim()
    ];
    if (answer.sources.length > 0) {
        lines.push("", chalk.bold("Sources"));
        for (const source of answer.sources) {
            lines.push(`- ${source.title} (${source.url})`);
        }
    }
    return lines.join("\n");
}
export function formatSearchResults(results) {
    const rows = [
        [chalk.bold("Title"), chalk.bold("Source"), chalk.bold("URL")],
        ...results.map((result) => [result.title, result.source, result.url])
    ];
    return table(rows);
}
export function formatLinks(links) {
    const rows = [
        [chalk.bold("Text"), chalk.bold("URL")],
        ...links.map((link) => [link.text || "(empty)", link.href])
    ];
    return table(rows);
}
//# sourceMappingURL=formatting.js.map