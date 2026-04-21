import type { RuntimeConfig, SearchResult } from "../types/index.js";

export class AiEngine {
  private transformersPromise?: Promise<{
    pipeline: (task: string, model: string) => Promise<(input: string, options?: Record<string, unknown>) => Promise<unknown>>;
  }>;

  constructor(private readonly config: RuntimeConfig) {}

  private async loadTransformers(): Promise<{
    pipeline: (task: string, model: string) => Promise<(input: string, options?: Record<string, unknown>) => Promise<unknown>>;
  }> {
    if (!this.transformersPromise) {
      this.transformersPromise = loadOptionalTransformers();
    }
    return this.transformersPromise;
  }

  async summarizeText(text: string): Promise<string> {
    if (!this.config.ai.enabled) {
      return heuristicSummary(text);
    }

    try {
      const transformers = await this.loadTransformers();
      const summarizer = await transformers.pipeline("summarization", "Xenova/distilbart-cnn-6-6");
      const result = await summarizer(text.slice(0, 4000), {
        max_length: 180,
        min_length: 40
      });
      const first = Array.isArray(result) ? result[0] : result;
      return first && "summary_text" in first ? first.summary_text : heuristicSummary(text);
    } catch {
      return heuristicSummary(text);
    }
  }

  async answerWithSources(query: string, sources: SearchResult[]): Promise<string> {
    const context = sources
      .map((source, index) => `${index + 1}. ${source.title}\n${source.snippet}\n${source.url}`)
      .join("\n\n");

    if (!this.config.ai.enabled) {
      return heuristicAnswer(query, sources);
    }

    try {
      const transformers = await this.loadTransformers();
      const generator = await transformers.pipeline("text2text-generation", "Xenova/flan-t5-base");
      const prompt = [
        "Answer the question using the sources below.",
        "Be concise, practical, and cite source titles in plain text.",
        `Question: ${query}`,
        `Sources:\n${context}`
      ].join("\n\n");

      const result = await generator(prompt, {
        max_new_tokens: Math.min(this.config.ai.maxTokens, 256),
        temperature: this.config.ai.temperature
      });
      const first = Array.isArray(result) ? result[0] : result;
      return first && "generated_text" in first ? first.generated_text.trim() : heuristicAnswer(query, sources);
    } catch {
      return heuristicAnswer(query, sources);
    }
  }
}

function heuristicSummary(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length <= 500 ? compact : `${compact.slice(0, 500)}...`;
}

function heuristicAnswer(query: string, sources: SearchResult[]): string {
  const bullets = sources.slice(0, 5).map((source) => `- ${source.title}: ${source.snippet}`);
  return [`OpenWeb found these relevant results for "${query}":`, ...bullets].join("\n");
}

async function loadOptionalTransformers(): Promise<{
  pipeline: (task: string, model: string) => Promise<(input: string, options?: Record<string, unknown>) => Promise<unknown>>;
}> {
  const importer = new Function("specifier", "return import(specifier);") as (specifier: string) => Promise<unknown>;
  return importer("@xenova/transformers") as Promise<{
    pipeline: (task: string, model: string) => Promise<(input: string, options?: Record<string, unknown>) => Promise<unknown>>;
  }>;
}
