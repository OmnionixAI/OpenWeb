import chalk from "chalk";
import { marked } from "marked";
import { table } from "table";
import type { QueryAnswer, SearchResult } from "../types/index.js";

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  return String(html).replace(/<[^>]+>/g, "").trim();
}

export function formatAnswer(answer: QueryAnswer): string {
  const lines = [
    chalk.cyan.bold("━━━ Query ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    chalk.whiteBright(answer.query),
    "",
    chalk.green.bold("━━━ Answer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    chalk.white(answer.answer.trim())
  ];

  if (answer.sources.length > 0) {
    lines.push("", chalk.blue.bold("━━━ Sources ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    for (const source of answer.sources) {
      lines.push(`${chalk.cyan("•")} ${chalk.whiteBright(source.title)}`);
      lines.push(`  ${chalk.dim.underline(source.url)}`);
    }
  }

  return lines.join("\n");
}

export function formatSearchResults(results: SearchResult[]): string {
  const rows = [
    [chalk.bold("Title"), chalk.bold("Source"), chalk.bold("URL")],
    ...results.map((result) => [result.title, result.source, result.url])
  ];
  return table(rows);
}

export function formatLinks(links: Array<{ text: string; href: string }>): string {
  const rows = [
    [chalk.bold("Text"), chalk.bold("URL")],
    ...links.map((link) => [link.text || "(empty)", link.href])
  ];
  return table(rows);
}
