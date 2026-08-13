# @git-diff-view/lynx

ReactLynx `DiffView` for the [Lynx](https://lynxjs.org/) runtime — wrap-first Split & Unified, built on `@git-diff-view/core`.

## Status (MVP)

| Feature | Support |
|---------|---------|
| Unified view | ✅ wrap |
| Split view | ✅ **v2 Wrap model** (one flex row = both sides) |
| Theme light/dark | ✅ CSS variables |
| Syntax highlight | ✅ AST/`nodeList` → nested `<text>` (no HTML templates) |
| Extend lines | ✅ `extendData` + `renderExtendLine` |
| Expand hidden lines | ✅ |
| `<list>` virtualization | ✅ Wrap Split + Unified (`estimated-main-axis-size-px`) |
| Unified `diffViewWrap={false}` | ✅ shared H scroll; line nums stay put (gutter outside H scroller) |
| `onDiffLineClick` | ✅ content / extend (Split side-aware) |
| Split `diffViewWrap={false}` dual-pane | ❌ not planned (sync hard on Lynx) |
| Add-widget / multiSelect | ❌ not planned (use `onDiffLineClick`) |

## Installation

```bash
pnpm add @git-diff-view/lynx
```

**Peer:** `@lynx-js/react` (>=0.100), `@lynx-js/types`. Does **not** require `react-dom`.

## Styles

```ts
import "@git-diff-view/lynx/styles/diff-view.css";
```

Styling is **Tailwind CSS v3** (`@lynx-js/tailwind-preset`) + CSS variables under `.theme-light` / `.theme-dark`. Prefer className; use inline style only for dynamic values (font size, gutter width, syntax colors, Lynx `scroll-view` attrs).

## API

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/lynx";
import "@git-diff-view/lynx/styles/diff-view.css";

<DiffView
  data={{
    oldFile: { fileName: "a.ts", content: "...", fileLang: "typescript" },
    newFile: { fileName: "b.ts", content: "...", fileLang: "typescript" },
    hunks: ["@@ -1,3 +1,4 @@\n..."],
  }}
  diffViewMode={DiffModeEnum.Split}
  diffViewTheme="light"
  diffViewHighlight
  diffViewWrap // default true — Wrap Split layout
  style={{ height: "100%" }}
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `data` | `{ oldFile?, newFile?, hunks }` | — | Same shape as react |
| `diffFile` | `DiffFile` | — | Prebuilt/cloned instance |
| `diffViewMode` | `DiffModeEnum` | SplitGitHub | Split vs Unified |
| `diffViewWrap` | `boolean` | `true` | **Unified only.** `false` → nowrap + shared H scroll; line numbers stay on the left. Split always wraps. |
| `diffViewTheme` | `"light" \| "dark"` | `"light"` | Sets `data-theme` |
| `diffViewHighlight` | `boolean` | — | `initSyntax` + AST colors |
| `diffViewFontSize` | `number` | `13` | CSS `--diff-font-size--` |
| `extendData` | `{ oldFile?, newFile? }` | — | Per-line extend payload |
| `renderExtendLine` | `(ctx) => ReactNode` | — | Custom extend UI |
| `onDiffLineClick` | `(payload) => void` | — | Tap content/extend row |
| `registerHighlighter` | highlighter | — | Prefer `@git-diff-view/lezer` on Lynx |

Also exports: `SplitSide`, `DiffModeEnum`, `DiffLineClickPayload`, and `@git-diff-view/core` re-exports.

## Architecture notes

- Calls `setEnableBuildTemplate(false)` — content is rendered from plain/syntax AST, not HTML templates.
- Split layout mirrors `packages/react/src/components/v2/DiffSplitViewWrap_v2`: single tree, `getSplitLines()` + `DiffFileLineType` dispatcher.
- Outer scroll: wrap uses virtualized `<list>`. Unified nowrap follows the official `<scroll-view>` model (one child, complex layout inside): vertical `<scroll-view>` → `[gutter | horizontal <scroll-view>]`. Line numbers never enter the H scroller (`sticky` only works on direct children and pins to the scroll-axis start, typically top).

## Lynx + highlight.js caveat

`@git-diff-view/core` depends on `@git-diff-view/lowlight` (full highlight.js grammars). Those grammars use Unicode property escapes (`\p{...}`) that **Lynx's JS engine rejects** during bytecode encode:

```text
SyntaxError: invalid escape sequence in regular expression
```

**Required for Lynx apps:** alias lowlight to the stub shipped with this package, and prefer **`@git-diff-view/lezer`** as `registerHighlighter` (pure JS LR parsers). Also stub `@lezer/markdown` — it has the same `\p{...}` problem:

```ts
// lynx.config.ts / rspeedy
import path from "node:path";

export default defineConfig({
  source: {
    alias: {
      "@git-diff-view/lowlight": path.resolve(
        "node_modules/@git-diff-view/lynx/src/stubs/lowlight.ts"
      ),
      "@lezer/markdown": path.resolve(
        "node_modules/@git-diff-view/lynx/src/stubs/lezer-markdown.ts"
      ),
    },
  },
});
```

```tsx
import { highlighter } from "@git-diff-view/lezer";
import { DiffView } from "@git-diff-view/lynx";

<DiffView
  diffViewHighlight
  registerHighlighter={highlighter}
  // ...
/>
```

`DiffView` runs `initSyntax` on the prepare path when `registerHighlighter` is set. It does **not** call the built-in lowlight highlighter on its own.

## Smoke checklist

Validate against `openspec/changes/add-react-lynx-diffview/specs/lynx-diffview/spec.md`:

1. Unified + Split with sample multi-hunk data
2. Highlight on/off, light/dark
3. Long lines wrap; Split row height follows max(side)
4. Expand hunk / extend line render

**Lynx version recorded for this MVP:** peer `@lynx-js/react` `>=0.100` (dev pin `^0.121.0`). Runtime smoke depends on your Lynx target (see `ui/lynx-example`).

## Example

See [`ui/lynx-example`](../../ui/lynx-example).
