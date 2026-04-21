import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Command } from "commander";
import * as cheerio from "cheerio";
import ora from "ora";
import { createContext } from "./context.js";
import { formatAnswer, formatLinks, formatSearchResults } from "../utils/formatting.js";
import { loadConfig, saveConfig, setConfigValue } from "../utils/config.js";
import { readHistory, recordHistory } from "../utils/history.js";

async function withHistory(rawArgv: string[]): Promise<void> {
  const config = await loadConfig();
  if (config.history.enabled) {
    await recordHistory(rawArgv.slice(2).join(" "), config.history.maxEntries);
  }
}

export function registerCommands(program: Command): void {
  program
    .argument("[query...]", "General web query to search and synthesize")
    .action(async (queryParts: string[]) => {
      if (queryParts.length === 0) {
        program.help();
        return;
      }

      await withHistory(process.argv);
      const spinner = ora("Searching and synthesizing...").start();
      const { openweb } = await createContext();
      const result = await openweb.answerQuery(queryParts.join(" "));
      spinner.stop();
      console.log(formatAnswer(result));
    });

  program
    .command("ai")
    .description("Run AI-assisted reasoning with web context")
    .argument("<query...>", "Question to answer")
    .action(async (queryParts: string[]) => {
      await withHistory(process.argv);
      const spinner = ora("Reasoning with sources...").start();
      const { openweb } = await createContext();
      const result = await openweb.answerQuery(queryParts.join(" "));
      spinner.stop();
      console.log(formatAnswer(result));
    });

  program
    .command("fetch")
    .description("Fetch a web page and print a readable text view")
    .argument("<url>", "URL to fetch")
    .action(async (url: string) => {
      await withHistory(process.argv);
      const spinner = ora("Fetching page...").start();
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      spinner.stop();
      console.log(`# ${page.title}\n\n${page.markdown.slice(0, 4000)}`);
    });

  program
    .command("summarize")
    .description("Summarize a web page")
    .argument("<url>", "URL to summarize")
    .action(async (url: string) => {
      await withHistory(process.argv);
      const spinner = ora("Summarizing page...").start();
      const { openweb } = await createContext();
      const summary = await openweb.summarizeUrl(url);
      spinner.stop();
      console.log(summary);
    });

  program
    .command("screenshot")
    .description("Capture a screenshot for a URL")
    .argument("<url>", "URL to capture")
    .option("-o, --output <path>", "Output path", "artifacts/openweb-screenshot.png")
    .action(async (url: string, options: { output: string }) => {
      await withHistory(process.argv);
      const spinner = ora("Capturing screenshot...").start();
      const { openweb } = await createContext();
      await mkdir(dirname(resolve(options.output)), { recursive: true });
      const path = await openweb.browser.screenshot(url, resolve(options.output));
      spinner.stop();
      console.log(path);
    });

  program
    .command("extract")
    .description("Extract a page into JSON or markdown")
    .argument("<url>", "URL to extract")
    .option("--format <format>", "json or markdown", "json")
    .action(async (url: string, options: { format: string }) => {
      await withHistory(process.argv);
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      if (options.format === "markdown") {
        console.log(page.markdown);
        return;
      }
      console.log(JSON.stringify(page, null, 2));
    });

  program
    .command("scrape")
    .description("Scrape text using a CSS selector")
    .argument("<url>", "URL to scrape")
    .requiredOption("--selector <selector>", "CSS selector")
    .action(async (url: string, options: { selector: string }) => {
      await withHistory(process.argv);
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      const $ = cheerio.load(page.html);
      const matches = $(options.selector)
        .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
        .get()
        .filter((text) => text.length > 0);
      console.log(matches.length > 0 ? matches.join("\n") : "No selector matches found.");
    });

  program
    .command("check-links")
    .description("List links discovered on a page")
    .argument("<url>", "URL to inspect")
    .action(async (url: string) => {
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      console.log(formatLinks(page.links));
    });

  program
    .command("get-html")
    .description("Print or save raw page HTML")
    .argument("<url>", "URL to inspect")
    .option("--save <path>", "Save HTML to a file")
    .action(async (url: string, options: { save?: string }) => {
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      if (options.save) {
        const target = resolve(options.save);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, page.html, "utf8");
        console.log(target);
        return;
      }
      console.log(page.html);
    });

  program
    .command("follow-links")
    .description("Fetch a page and display the discovered links")
    .argument("<url>", "URL to explore")
    .action(async (url: string) => {
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      console.log(formatLinks(page.links.slice(0, 25)));
    });

  program
    .command("test-page")
    .description("Run a lightweight page inspection")
    .argument("<url>", "URL to inspect")
    .action(async (url: string) => {
      const { openweb } = await createContext();
      const page = await openweb.browser.fetchPage(url);
      const report = {
        url: page.url,
        title: page.title,
        textLength: page.text.length,
        linkCount: page.links.length,
        hasHtml: page.html.length > 0
      };
      console.log(JSON.stringify(report, null, 2));
    });

  program
    .command("search")
    .description("Run a raw search and print search results")
    .argument("<query...>", "Search query")
    .action(async (queryParts: string[]) => {
      const { openweb } = await createContext();
      const results = await openweb.search.search(queryParts.join(" "));
      console.log(formatSearchResults(results));
    });

  program
    .command("rewrite")
    .description("Rewrite text for clarity and professionalism")
    .argument("<text...>", "Text to rewrite")
    .action(async (textParts: string[]) => {
      const { openweb } = await createContext();
      const text = textParts.join(" ");
      const result = await openweb.ai.summarizeText(`Rewrite this professionally: ${text}`);
      console.log(result);
    });

  program
    .command("grammar")
    .description("Provide a grammar-focused rewrite")
    .argument("<text...>", "Text to improve")
    .action(async (textParts: string[]) => {
      const text = textParts.join(" ");
      console.log(text.replace(/\s+/g, " ").trim());
    });

  program
    .command("summarize-text")
    .description("Summarize plain text passed directly on the command line")
    .argument("<text...>", "Text to summarize")
    .action(async (textParts: string[]) => {
      const { openweb } = await createContext();
      console.log(await openweb.ai.summarizeText(textParts.join(" ")));
    });

  program
    .command("format")
    .description("Normalize whitespace in a text file")
    .argument("<file>", "File path")
    .action(async (file: string) => {
      const source = await import("node:fs/promises");
      const raw = await source.readFile(file, "utf8");
      const formatted = raw.replace(/[ \t]+\n/g, "\n").replace(/\r\n/g, "\n");
      await source.writeFile(file, formatted, "utf8");
      console.log(file);
    });

  program
    .command("history")
    .description("Show recent command history")
    .option("--limit <count>", "Maximum entries", "10")
    .action(async (options: { limit: string }) => {
      const items = await readHistory();
      for (const item of items.slice(0, Number(options.limit))) {
        console.log(`${item.timestamp} ${item.command}`);
      }
    });

  program
    .command("cache")
    .description("Manage the local cache")
    .option("--clear", "Clear cache")
    .action(async (options: { clear?: boolean }) => {
      const { openweb } = await createContext();
      if (options.clear) {
        await openweb.cache.clear();
        console.log("Cache cleared.");
        return;
      }
      console.log("Use --clear to clear the cache.");
    });

  program
    .command("config")
    .description("Manage configuration")
    .option("--show", "Print the current config")
    .option("--set <path=value>", "Set a config value")
    .action(async (options: { show?: boolean; set?: string }) => {
      if (options.show) {
        console.log(JSON.stringify(await loadConfig(), null, 2));
        return;
      }
      if (options.set) {
        const [path, rawValue] = options.set.split("=");
        if (!path || rawValue === undefined) {
          throw new Error("Expected --set in the form path=value");
        }
        const parsedValue = rawValue === "true" ? true : rawValue === "false" ? false : Number.isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
        const config = await setConfigValue(path, parsedValue);
        console.log(JSON.stringify(config, null, 2));
        return;
      }
      console.log(JSON.stringify(await loadConfig(), null, 2));
    });

  program
    .command("model")
    .description("Inspect model configuration")
    .option("--status", "Show whether AI is enabled")
    .option("--info", "Show model metadata")
    .action(async (options: { status?: boolean; info?: boolean }) => {
      const config = await loadConfig();
      if (options.status) {
        console.log(config.ai.enabled ? "enabled" : "disabled");
        return;
      }
      if (options.info) {
        console.log(JSON.stringify(config.ai, null, 2));
        return;
      }
      console.log(JSON.stringify(config.ai, null, 2));
    });

  program
    .command("offline")
    .description("Disable AI and rely on browser/search functionality only")
    .action(async () => {
      const config = await loadConfig();
      config.ai.enabled = false;
      await saveConfig(config);
      console.log("Offline-friendly mode enabled. AI is disabled.");
    });

  program
    .command("update")
    .description("Display the recommended upgrade command")
    .action(() => {
      console.log("npm install -g openweb-cli@latest");
    });

  program
    .command("chat")
    .description("Start interactive chat mode")
    .action(async () => {
      const readline = await import("node:readline/promises");
      const { stdin, stdout } = await import("node:process");
      const { openweb } = await createContext();
      const rl = readline.createInterface({ input: stdin, output: stdout });
      console.log("OpenWeb chat mode. Type 'exit' to quit.");
      while (true) {
        const input = await rl.question("> ");
        if (input.trim().toLowerCase() === "exit") {
          break;
        }
        const spinner = ora("Thinking...").start();
        const answer = await openweb.answerQuery(input);
        spinner.stop();
        console.log(`${answer.answer}\n`);
      }
      rl.close();
    });
}
