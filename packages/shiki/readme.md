# @git-diff-view/shiki

> Advanced syntax highlighter for @git-diff-view using Shiki

[![npm version](https://img.shields.io/npm/v/@git-diff-view/shiki)](https://www.npmjs.com/package/@git-diff-view/shiki)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/shiki)](https://www.npmjs.com/package/@git-diff-view/shiki)

Alternative syntax highlighter using [Shiki](https://shiki.style/) for more accurate highlighting with TextMate grammars and VSCode themes.

## Features

- ✅ VSCode-quality syntax highlighting
- ✅ TextMate grammar support
- ✅ VSCode-compatible themes
- ✅ More accurate language support
- ✅ Better color fidelity
- ✅ Async initialization

## Installation

```bash
npm install @git-diff-view/shiki
# or
pnpm add @git-diff-view/shiki
# or
yarn add @git-diff-view/shiki
```

## Usage

### Basic Usage

```typescript
import { DiffFile } from "@git-diff-view/core";
import { getDiffViewHighlighter } from "@git-diff-view/shiki";

const diffFile = new DiffFile(
  oldFileName,
  oldContent,
  newFileName,
  newContent,
  hunks,
  "typescript",
  "typescript"
);

// Initialize raw diff data first
diffFile.initRaw();

// Get Shiki highlighter (async)
const highlighter = await getDiffViewHighlighter();

// Apply syntax highlighting with Shiki
diffFile.initSyntax({ registerHighlighter: highlighter });

// Build views
diffFile.buildSplitDiffLines();
diffFile.buildUnifiedDiffLines();

// Get bundle
const bundle = diffFile.getBundle();
```

### With Custom Shiki Configuration

```typescript
import { getDiffViewHighlighter } from "@git-diff-view/shiki";

const highlighter = await getDiffViewHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['typescript', 'javascript', 'python']
});

diffFile.initSyntax({ registerHighlighter: highlighter });
```

## API Reference

### getDiffViewHighlighter()

Get a configured Shiki highlighter instance.

```typescript
async function getDiffViewHighlighter(
  options?: ShikiOptions
): Promise<Highlighter>
```

#### Options

Accepts standard [Shiki configuration options](https://shiki.style/guide/install).

## Comparison

| Feature | @git-diff-view/lowlight | @git-diff-view/shiki |
|---------|------------------------|---------------------|
| Default | ✅ Built-in | ❌ Separate package |
| Setup | No setup needed | Async initialization |
| Accuracy | Good | Excellent (VSCode-level) |
| Themes | highlight.js themes | VSCode themes |
| Bundle Size | Smaller | Larger |
| Performance | Synchronous | Async |

## When to Use

Use **@git-diff-view/shiki** when you need:
- VSCode-quality syntax highlighting
- Accurate language grammar
- VSCode-compatible themes
- Better color fidelity

Use **@git-diff-view/lowlight** (default) when:
- You want zero configuration
- Bundle size is critical
- Synchronous initialization is preferred
- Basic highlighting is sufficient

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Core diff engine
- [@git-diff-view/lowlight](https://www.npmjs.com/package/@git-diff-view/lowlight) - Default highlighter
- [Shiki](https://shiki.style/) - Underlying library

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
