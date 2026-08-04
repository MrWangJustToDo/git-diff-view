# @git-diff-view/lezer

> Syntax highlighter for @git-diff-view using [Lezer](https://lezer.codemirror.net/)

[![npm version](https://img.shields.io/npm/v/@git-diff-view/lezer)](https://www.npmjs.com/package/@git-diff-view/lezer)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/lezer)](https://www.npmjs.com/package/@git-diff-view/lezer)

Alternative syntax highlighter based on CodeMirror's Lezer parsers. Pure JavaScript LR parsers (no WASM / Node APIs), suitable for constrained runtimes such as Lynx.

Emits hast with `--diff-view-light` / `--diff-view-dark` CSS variables, compatible with the same rendering path as `@git-diff-view/shiki`.

## Features

- Pure JS parsers (no Oniguruma WASM)
- Dual light/dark token colors via CSS variables
- Sync parse, async API aligned with `@git-diff-view/shiki`
- Extensible language registry

## Installation

```bash
npm install @git-diff-view/lezer
# or
pnpm add @git-diff-view/lezer
# or
yarn add @git-diff-view/lezer
```

## Usage

### Basic Usage

```typescript
import { DiffFile } from "@git-diff-view/core";
import { highlighter } from "@git-diff-view/lezer";
// or: import { getDiffViewHighlighter } from "@git-diff-view/lezer";

const diffFile = new DiffFile(
  oldFileName,
  oldContent,
  newFileName,
  newContent,
  hunks,
  "typescript",
  "typescript"
);

diffFile.initRaw();
diffFile.initSyntax({ registerHighlighter: highlighter });
diffFile.buildSplitDiffLines();
diffFile.buildUnifiedDiffLines();
```

### Custom Token Colors

```typescript
import { getDiffViewHighlighter, tags, setTokenColors } from "@git-diff-view/lezer";

// Via init options (replace default palette)
const highlighter = await getDiffViewHighlighter({
  tokenColors: [
    { tag: tags.keyword, color: { light: "#D73A49", dark: "#FF7B72" } },
    { tag: tags.string, color: { light: "#032F62", dark: "#A5D6FF" } },
  ],
});

// Or extend the built-in GitHub-like palette
await getDiffViewHighlighter({
  extendTokenColors: true,
  tokenColors: [{ tag: tags.comment, color: { light: "#6A737D", dark: "#8B949E" } }],
});

// Or mutate at runtime (before initSyntax / getAST)
setTokenColors([{ tag: tags.keyword, color: { light: "#D73A49", dark: "#FF7B72" } }], { extend: true });
```

`defaultTokenColors` is adapted from [@uiw/codemirror-theme-github](https://github.com/uiwjs/react-codemirror/blob/master/themes/github/src/index.ts) (same Lezer `tags`). Only colors are applied as CSS variables; CM-only styles like `fontWeight` / `textDecoration` are skipped. Extra tags not listed in uiw fall back via Lezer specificity or map to the closest uiw group.

### Limit Built-in Languages

```typescript
import { getDiffViewHighlighter } from "@git-diff-view/lezer";

const highlighter = await getDiffViewHighlighter({
  langs: ["typescript", "javascript", "json", "css"],
});

diffFile.initSyntax({ registerHighlighter: highlighter });
```

### Register a Custom Parser

```typescript
import { getDiffViewHighlighter, registerLanguage } from "@git-diff-view/lezer";
import type { Tree } from "@lezer/common";

const highlighter = await getDiffViewHighlighter();

registerLanguage({
  name: "custom",
  aliases: ["my-lang"],
  parse: (input): Tree => myParser.parse(input),
});

diffFile.initSyntax({ registerHighlighter: highlighter });
```

## Built-in Languages

`javascript` / `jsx` / `typescript` / `tsx` / `json` / `python` / `java` / `cpp` / `css` / `html` / `xml` / `rust` / `go` / `php` / `yaml` / `markdown` / `sass`

## Comparison

| Feature | @git-diff-view/lowlight | @git-diff-view/shiki | @git-diff-view/lezer |
|---------|-------------------------|----------------------|----------------------|
| Engine | highlight.js | TextMate / Shiki | Lezer LR |
| WASM | No | Optional | No |
| Init | Sync | Async | Sync parse / async API |
| Theme colors | CSS classes | CSS variables | CSS variables |
| Lynx-friendly | Often no (`\\p{}`) | Unreliable | Better candidate |

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Core diff engine
- [@git-diff-view/shiki](https://www.npmjs.com/package/@git-diff-view/shiki) - Shiki highlighter
- [@git-diff-view/lowlight](https://www.npmjs.com/package/@git-diff-view/lowlight) - Default highlighter
- [Lezer](https://lezer.codemirror.net/) - Underlying parser system

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
