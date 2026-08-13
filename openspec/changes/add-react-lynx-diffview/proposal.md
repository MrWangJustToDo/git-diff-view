## Why

We need a native mobile (and Lynx Web) DiffView for ReactLynx apps. The existing `@git-diff-view/react` package is tightly coupled to browser DOM (`<table>`, CSS variables + Tailwind, `dangerouslySetInnerHTML`, `ResizeObserver`, canvas text measure), so it cannot run on Lynx’s `<view>` / `<text>` native renderer. Adding `@git-diff-view/lynx` unlocks TikTok/ByteDance-style native clients while reusing the battle-tested `@git-diff-view/core` engine.

## What Changes

- Add a new package `@git-diff-view/lynx` that exposes `DiffView` for **ReactLynx**.
- Reuse `@git-diff-view/core` (+ optional `@git-diff-view/file` / highlighters) for parsing, `DiffFile` lifecycle, and syntax AST.
- Port the **React DOM DiffView API surface** (props/ref semantics) where Lynx can support it; adapt layout/styling to Lynx primitives.
- **Do not** fork `@git-diff-view/react` components; follow the non-DOM binding pattern from `@git-diff-view/cli` (`setEnableBuildTemplate(false)`, AST-based content render).
- MVP includes **Unified + Split**, with **wrap-first** layout (Lynx native text wrapping), plus in-repo `ui/lynx-example`.
- No **BREAKING** changes to existing packages.

## Capabilities

### New Capabilities

- `lynx-diffview`: ReactLynx DiffView package — data/`diffFile` modes, Split/Unified views, wrap-first content layout, theme/highlight, extend lines, Lynx-native styling, and documented API parity/gaps vs `@git-diff-view/react`.

### Modified Capabilities

- _(none — `openspec/specs/` is empty)_

## Impact

- **New code:** `packages/lynx/`, `ui/lynx-example/`.
- **Dependencies:** `@git-diff-view/core`; ReactLynx runtime as peer; avoid `react-dom` and browser-only `@git-diff-view/utils` DOM/canvas APIs.
- **Reuse:** DiffFile lifecycle, SplitSide, DiffModeEnum, highlighters (AST, not HTML templates).
- **Deferred / out of MVP:** add-widget chrome, multi-select, experimental `v2/` split, optional nowrap + horizontal-scroll mode (if needed later).
- **Docs:** root README + package readme feature matrix; AGENTS.md package list.

## Current-state review (priority & blockers)

### What we can reuse today

| Layer | Reuse? |
|-------|--------|
| `DiffFile` init / split / unified / syntax / subscribe | Yes |
| `data` vs `diffFile` entry modes | Yes |
| Theme / highlight / extendData + renderExtendLine | Yes (API); render host changes |
| lowlight/shiki AST | Yes |
| CLI pattern: disable HTML templates | Yes |

### Decisions from review (resolved)

| Question | Decision |
|----------|----------|
| Split in MVP? | **Yes** — Unified + Split |
| Platforms | **Cross-platform by design** (iOS / Android / Lynx Web share elements); smoke-test whatever targets the example can run; no separate Web fork |
| Wrap vs nowrap first? | **Wrap-first** — primary reason: Split wrap = **one row / both sides** (v2 Wrap). No-wrap Split = **two HScroll containers** + Y sync (`Normal_v2`). Unified 无此差异。Lynx 文本换行是加分项，不是主因。参考 `packages/react/src/components/v2` |
| Example app? | **Yes** — `ui/lynx-example` |

### Implementation priority (phased)

1. **P0 — Package + shell:** scaffold, DiffFile lifecycle, context/store.
2. **P0 — Content + wrap layout:** AST/plain coloring; flex rows; text wraps within column width.
3. **P0 — Unified:** content + hunk + extend with wrap.
4. **P1 — Split:** side-by-side wrap rows (single row = both sides, natural height).
5. **P1 — Example + docs:** `ui/lynx-example`, API parity table.
6. **P2 — Scroll sync polish / `<list>` virtualization / nowrap mode.**
7. **P3 — Widgets / multi-select** if product needs them.

### Blockers / open risks

1. **No HTML table / innerHTML** — redesign layout and content rendering.
2. **Split row height** — prefer one flex row containing both sides so wrap heights stay aligned; avoid browser-style `useSyncHeight` if possible.
3. **Scroll sync** — Lynx `scroll-view` APIs; independent panes OK for early Split, sync as stretch goal.
4. **Dual-thread ReactLynx** — heavy `initSyntax` in effects; protect first paint.
5. **List performance** — large diffs may need `<list>` later.
6. **Tooling** — Rspeedy / ReactLynx peer versions during scaffold.

### Remaining open questions (deferrable)

1. Exact ReactLynx / Rspeedy peer version range.
2. Whether Split scroll sync is required before v1 tag, or independent panes are enough.
3. Whether nowrap (`diffViewWrap={false}`) is needed soon after MVP.
