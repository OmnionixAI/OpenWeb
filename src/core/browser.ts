import { chromium } from "playwright";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import type { FetchedPage } from "../types/index.js";
import type { RuntimeConfig } from "../types/index.js";

const turndown = new TurndownService();

export class BrowserService {
  constructor(private readonly config: RuntimeConfig) {}

  async fetchPage(url: string): Promise<FetchedPage> {
    const browser = await chromium.launch({ headless: this.config.browser.headless });
    const page = await browser.newPage({ userAgent: this.config.browser.userAgent });

    try {
      await page.goto(url, {
        timeout: this.config.browser.timeoutMs,
        waitUntil: "domcontentloaded"
      });
      await page.waitForLoadState("networkidle", { timeout: this.config.browser.timeoutMs }).catch(() => undefined);
      const html = await page.content();
      const title = await page.title();
      const $ = cheerio.load(html);
      const text = $("body").text().replace(/\s+/g, " ").trim();
      const markdown = turndown.turndown(html);
      const links = $("a")
        .map((_, element) => ({
          text: $(element).text().trim(),
          href: $(element).attr("href") ?? ""
        }))
        .get()
        .filter((link) => link.href.length > 0);

      return {
        url,
        title,
        html,
        text,
        markdown,
        links
      };
    } finally {
      await page.close().catch(() => undefined);
      await browser.close().catch(() => undefined);
    }
  }

  async screenshot(url: string, outputPath: string): Promise<string> {
    const browser = await chromium.launch({ headless: this.config.browser.headless });
    const page = await browser.newPage({ userAgent: this.config.browser.userAgent });

    try {
      await page.goto(url, {
        timeout: this.config.browser.timeoutMs,
        waitUntil: "networkidle"
      });
      await page.screenshot({ path: outputPath, fullPage: true });
      return outputPath;
    } finally {
      await page.close().catch(() => undefined);
      await browser.close().catch(() => undefined);
    }
  }
}
