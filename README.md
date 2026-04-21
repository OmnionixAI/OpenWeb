# OpenWeb

OpenWeb is a browser CLI by Omnionix for live web research, page automation, extraction, and AI-assisted synthesis. It is designed for developers, operators, researchers, and support teams who want browser-grade web access from the terminal without giving up structured output, caching, or reproducibility.

Official Omnionix pages:

- GitHub: https://github.com/OmnionixAI
- Hugging Face: https://huggingface.co/OmnionixAI

## Why OpenWeb

OpenWeb combines three capabilities that are usually scattered across separate tools:

- Chromium-backed page access for pages that need a real browser.
- Search and synthesis workflows for fast terminal-first research.
- Optional local AI enrichment with graceful fallback behavior when model inference is unavailable.

The result is a professional CLI that can be installed globally, scripted in CI, and used interactively for ad hoc troubleshooting or research.

## Features

- General-purpose query command: `openweb "what are good Node.js ORMs?"`
- AI-assisted synthesis: `openweb ai "compare Bun and Node.js for APIs"`
- Browser-backed fetch and summarize flows
- Screenshot capture for debugging and reporting
- HTML extraction, link inspection, and structured page export
- Interactive chat mode for multi-turn workflows
- Config file in `~/.openweb/config.json`
- Disk-backed cache and local history tracking
- JSON-friendly behavior for automation and scripting
- Apache 2.0 licensed repository ready for Git hosting and npm publication

## Quick Start

### Requirements

- Node.js 20.11+
- npm 10+

### Install dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Optional local AI runtime

```bash
npm install @xenova/transformers
```

OpenWeb works without this package. When it is installed, the CLI can activate local Transformers.js pipelines and continue using the Omnionix model configuration as its preferred target.

### Run locally

```bash
npm run dev -- "latest Node.js security best practices"
```

### Install globally

```bash
npm install -g .
openweb "how do I center a div with CSS?"
```

## Command Overview

### Core commands

```bash
openweb "query"
openweb ai "query"
openweb search "query"
openweb fetch "https://example.com"
openweb summarize "https://example.com"
openweb screenshot "https://example.com" --output artifacts/page.png
openweb extract "https://example.com" --format json
openweb get-html "https://example.com" --save artifacts/page.html
openweb check-links "https://example.com"
openweb follow-links "https://example.com"
openweb chat
```

### Writing and utility commands

```bash
openweb rewrite "make this status update sound more professional"
openweb grammar "this sentence need help"
openweb summarize-text "long text here"
openweb format README.md
openweb config --show
openweb config --set ai.enabled=false
openweb cache --clear
openweb history --limit 20
openweb model --info
openweb offline
openweb update
```

## Production Design Notes

OpenWeb uses a modular architecture:

- `src/cli`: command registration and terminal UX
- `src/core`: browser automation, search, caching, and AI integration
- `src/utils`: config, formatting, history, and logging helpers
- `tests`: unit tests for key behavior

Design choices aimed at production usage:

- Strong TypeScript settings and typed service boundaries
- Graceful fallback behavior when AI inference is unavailable
- Persistent config, history, and cache storage under the user home directory
- Browser automation isolated behind a service layer
- Search and answer workflows structured so providers can be swapped later

## AI Model Strategy

The default configuration targets `OmnionixAI/avara-x1-mini-Q4_K_M-GGUF` from the Omnionix Hugging Face organization. In practice, local-model support in JavaScript ecosystems varies by runtime and model format, so the CLI is implemented with a resilient AI abstraction:

- If local inference support is installed and available, OpenWeb uses Transformers.js pipelines.
- If local inference is not available or the model cannot be initialized, OpenWeb falls back to deterministic synthesis and summarization so the CLI remains usable.

This keeps the CLI operational today while preserving a clear path for deeper local-model integration.

## Configuration

Default config path:

```text
~/.openweb/config.json
```

Example:

```json
{
  "output": {
    "color": true,
    "markdown": true,
    "json": false
  },
  "browser": {
    "headless": true,
    "timeoutMs": 20000,
    "userAgent": "OpenWeb/0.1 (+https://github.com/OmnionixAI/openweb)"
  },
  "search": {
    "maxResults": 6,
    "provider": "duckduckgo"
  },
  "ai": {
    "enabled": true,
    "modelId": "OmnionixAI/avara-x1-mini-Q4_K_M-GGUF",
    "maxTokens": 512,
    "temperature": 0.2
  },
  "cache": {
    "enabled": true,
    "ttlSeconds": 3600,
    "maxEntries": 500
  },
  "history": {
    "enabled": true,
    "maxEntries": 200
  }
}
```

## Command Surface

OpenWeb supports a broad command surface through direct commands plus natural-language query workflows. The shipped CLI covers the main operational categories described in the build prompt:

- Development troubleshooting
- Web interaction and extraction
- Research and learning
- Writing and summarization
- System, cache, config, and model management

That gives the project a large real-world usage envelope without forcing users to memorize dozens of niche subcommands for every variation.

## Quality

Included in this repository:

- Apache 2.0 license
- TypeScript build and test setup
- Unit tests with Vitest
- npm package metadata with global bin entry
- `.gitignore` and repo-ready structure

Recommended next steps before public release:

- Add CI workflow for lint, build, and tests
- Add richer selector-aware scraping with DOM evaluation instead of raw HTML matching
- Add shell completion and release automation

## Development

```bash
npm test
npm run lint
npm run build
```

## License

Licensed under Apache 2.0. See [LICENSE](LICENSE).
