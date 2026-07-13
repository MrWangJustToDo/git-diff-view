# Scroll Tests

Manual and automated tests for the CodeView scroll API.

## Prerequisites

Build the CLI package so `@git-diff-view/cli` exports scroll utilities:

```bash
pnpm run build:packages
# or from packages/cli:
# cd ../.. && pnpm run build:packages
```

## Automated tests

```bash
pnpm --filter @git-diff-view/cli test:scroll
```

Runs:

| File | Coverage |
|------|----------|
| `scroll-unit.test.mjs` | Pure scroll functions: clamp, computeScrollState, scrollToTop/Bottom, scrollUp/Down (visual + logical), slice |
| `codeview-layout.test.mjs` | `buildCodeViewLayout`: empty file, narrow width, wrap, CJK, tabs, emoji, large files, scroll integration |
| `diffview-layout.test.mjs` | `buildDiffViewScrollLayout`: unified/split, extend lines, visible slice + `ScrollState` |

### Edge cases covered

- Empty file / whitespace-only lines
- Columns too narrow (`contentWidth <= 0`)
- Long ASCII wrap + partial clip (`startLine` stays on wrapped line)
- CJK double-width wrap
- Tab expansion (`codeViewTabSpace`)
- Emoji / wide characters
- 120-line file scroll targets
- Boundary clamping (offset, line number)
- Logical vs visual step scrolling
- Line taller than viewport (`scrollToBottom`)

## Interactive demo

```bash
# CodeView
pnpm --filter @git-diff-view/cli test:scroll:interactive

# DiffView (split/unified toggle, extend lines)
pnpm --filter @git-diff-view/cli test:scroll:interactive:diffview
```

| Key | Action |
|-----|--------|
| `j` / `k` | Scroll down / up (visual row) |
| `d` / `u` | Scroll down / up (logical display line) |
| `g` / `G` | Scroll to sequence top / bottom |
| `t` / `b` | `scrollToTop` / `scrollToBottom` for jump target |
| `+` / `-` | Adjust jump target line |
| `s` / `U` | Split / Unified mode (**DiffView only**) |
| `q` | Quit |

Footer shows live `ScrollState`. DiffView `line` refers to the flattened display sequence (hunk / content / extend).

## Fixtures

See `fixtures.mjs` for reusable test content (`LONG_ASCII_LINE`, `CJK_CONTENT`, `MANY_LINES`, etc.).

## Helpers

See `helpers.mjs` for `makeScrollLayout()` (synthetic layouts) and `createPlainFile()`.
