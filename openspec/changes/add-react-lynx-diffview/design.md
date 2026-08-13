## Context

See `proposal.md` for motivation. Constraints that shape this design:

- **Primary UI reference:** `@git-diff-view/react` **`components/v2`** (div/flex, not `<table>`). v1 table-based Split is the wrong Lynx blueprint.
- **Content/rendering reference:** `@git-diff-view/cli` for `setEnableBuildTemplate(false)` + AST/plain coloring (no `dangerouslySetInnerHTML`).
- Lynx (ReactLynx) uses `<view>` / `<text>` / `<scroll-view>` / `<list>`, CSS (incl. variables), flex/linear/grid, dual-thread JS; elements are platform-agnostic.
- **Resolved product choices:** MVP = Unified + Split, **wrap-first**, `ui/lynx-example`.

### Split layout model (why wrap-first is simpler)

This is the critical product/architecture detail (not “Lynx wraps text so wrap is easy” alone):

| Mode | Split structure | Height / scroll |
|------|-----------------|-----------------|
| **Wrap** (`DiffSplitViewWrap_v2`) | **One** document tree. Each logical line is **one** flex row: oldNum + oldContent \| newNum + newContent | Row height = max(left, right) naturally. No dual-pane sync. |
| **No-wrap** (`DiffSplitViewNormal_v2`) | **Two** side containers (`old-diff-table-wrapper` / `new-…`), each with its own line list | Independent **horizontal** scroll per side; **vertical** `syncScroll`; hunk/extend/widget need `useSyncHeight` across sides |
| **Unified** | Always one column | Wrap vs no-wrap only changes text wrap / HScroll of that single column — **no dual-container problem** |

v2 Wrap content line (`DiffSplitContentLineWrap_v2`): one `div.diff-line.flex` owns both sides.  
v2 Normal content line (`DiffSplitContentLineNormal_v2`): takes `side`, renders only that side inside its pane.

Line iteration in v2: `getSplitLines()` → typed dispatcher (`hunk` / `content` / `widget` / `extend`) via `DiffFileLineType` — cleaner than v1’s content-only loop + sibling hunk/extend.

**Lynx MVP implication:** implement the **wrap Split model** (single tree, one row both sides) + Unified wrap. Defer no-wrap dual-pane HScroll (+ syncScroll / useSyncHeight equivalents).

## Goals / Non-Goals

**Goals:**

- Ship `@git-diff-view/lynx` with ReactLynx `DiffView` for **Unified + Split**, **wrap-first**.
- Align props/semantics with `@git-diff-view/react` where supported; document gaps.
- Reuse core `DiffFile` lifecycle and highlighters without HTML templates.
- Cross-platform via Lynx element model (no separate Web fork).

**Non-Goals (MVP):**

- `diffViewAddWidget` / widget store, `DiffViewWithMultiSelect`, `components/v2/*`.
- Browser-faithful nowrap + horizontal scrollbar parity (optional follow-up).
- Sharing source with `@git-diff-view/react`.
- Perfect GitHub pixel parity.

## Decisions

### 1. Package name: `@git-diff-view/lynx`

- **Choice:** `packages/lynx` → npm `@git-diff-view/lynx`.
- **Rationale:** Matches host-named packages (`cli`); ReactLynx is the binding, not the product name.

### 2. Architecture: new package, **v2 wrap-shaped** tree, CLI content strategy

```
@git-diff-view/core
        ↓
@git-diff-view/lynx
  DiffView
    ├── DiffUnifiedView          ← one column, wrap text
    └── DiffSplitView (wrap)     ← mirror DiffSplitViewWrap_v2
          getSplitLines() → DiffSplitViewLine switch
          DiffSplitContentLine   ← one row = both sides (v2 Wrap)
          DiffSplitHunk/Extend   ← same single-tree row model
          DiffContent            ← AST/plain → nested <text>, enableWrap=true
```

- Blueprint files: `packages/react/src/components/v2/DiffSplitViewWrap_v2.tsx`, `DiffSplitViewLineWrap_v2.tsx`, `DiffSplitContentLineWrap_v2.tsx`, and sibling Wrap hunk/extend/widget.
- Do **not** start from `DiffSplitViewNormal_v2` (dual scroll containers).
- `setEnableBuildTemplate(false)`; render from `syntaxLine.nodeList` / change ranges.

### 3. Platforms: one codebase for all Lynx targets

- **Choice:** Implement once against Lynx elements; smoke-test on whatever targets the example supports (prefer at least one native **or** Lynx Web during development).
- **Rationale:** Lynx’s model is intentionally cross-platform; “天生支持” is correct at the API/element layer. Residual differences (font metrics, scroll feel) are runtime quirks to note in docs, not separate packages.
- **Alternative:** Native-only first — rejected as unnecessary fork.

### 4. Styling: **Tailwind CSS v3 + CSS custom properties**

- **Choice:** Tailwind (with `@lynx-js/tailwind-preset`) for layout/spacing, mirroring `@git-diff-view/react` v2 class patterns; theme tokens as CSS variables under `.theme-light` / `.theme-dark`; semantic surface classes (`.diff-surface-*`) consume `var(--diff-*)` in the **stylesheet** (not inline `var()`).
- **Inline style** only for values that must be dynamic at runtime (e.g. computed gutter width in px, `fontSize` from `diffViewFontSize`, syntax-run colors, Lynx-only `scroll-view` / `linearDirection`).
- **Rationale:** Lynx documents Tailwind v3 + preset; DOM package already uses Tailwind; stylesheet `var()` is reliable on Lynx while inline `var()` is not.
- **Build:** `packages/lynx` PostCSS `gen:css` (theme + utilities); `ui/lynx-example` uses `rsbuild-plugin-tailwindcss` and scans package source when aliased.

### 5. Wrap-first layout (MVP default) — container model, not just CSS wrap

- **Choice:** MVP = **wrap Split + wrap Unified**, matching react **v2 Wrap** structure.
- **Rationale (authoritative):**
  1. **Split wrap = one row displays both sides** → height alignment is free; no dual containers.
  2. **Split no-wrap = two scroll containers** (independent X scroll, synced Y) → much harder on Lynx (`scroll-view` ×2, sync, cross-pane height for hunk/extend).
  3. **Unified** has no dual-container split; wrap vs no-wrap difference is local to text.
  4. Lynx `<text>` wrap helps content, but the **architecture win** is the single-tree Split row model from v2 Wrap.
- **Follow-up:** `diffViewWrap={false}` → dual-pane Normal model (`DiffSplitViewNormal_v2`) if needed.
- **Alternative considered:** Non-wrap first — rejected; misunderstands Split complexity.

### 6. Split scroll

- Early Split: independent vertical `scroll-view` panes acceptable.
- Stretch: sync via Lynx scroll events before release if low-cost; otherwise document independent panes for v1.

### 7. Dual-thread / performance

- DiffFile heavy work in effects (background-only rules).
- Prefer prebuilt `diffFile` / worker bundles for large files.
- Plan `<list>` virtualization as post-MVP.

### 8. Example: `ui/lynx-example`

- Demonstrate data and/or diffFile, Unified/Split, theme, extend line.
- Pin ReactLynx / Rspeedy versions used.

### 9. Feature parity matrix

| Feature | React DOM | Lynx MVP |
|---------|-----------|----------|
| data / diffFile | ✅ | ✅ |
| Unified / Split | ✅ | ✅ |
| Wrap (long lines) | via `diffViewWrap` | ✅ **default (wrap-first)** |
| Nowrap + HScroll | default when wrap off | ⏳ follow-up |
| Theme / highlight | ✅ | ✅ |
| extendData / renderExtendLine | ✅ | ✅ |
| diffViewFontSize | ✅ | ✅ |
| add widget | ✅ | ❌ deferred |
| multiSelect | ✅ | ❌ deferred |
| v2 split | experimental | ❌ out of scope |

## Risks / Trade-offs

- **[Risk] Flex + wrapping text column needs `min-width: 0` / overflow tricks** (same class of issues as web flex) → Mitigation: early spike on long-line Unified/Split; document layout CSS.
- **[Risk] Nested `<text>` for syntax colors may affect wrap metrics** → Mitigation: keep runs as inline text children; visual QA on highlight on/off.
- **[Risk] Dual-thread + reactivity-store** → Mitigation: spike; fall back to React context + external store if needed.
- **[Risk] Large diff jank** → Mitigation: `<list>` follow-up; DiffFile/worker path.
- **[Risk] Platform font/wrap differences (iOS vs Android vs Web)** → Mitigation: one codebase; note quirks in docs; smoke multiple targets when available.
- **[Trade-off] Wrap-first skips nowrap parity initially** → Accept; nowrap is explicit follow-up.

## Migration Plan

- Additive package only.
- Release after example smoke on at least one Lynx target.
- Rollback: drop package; no impact on react/vue/cli.

## Open Questions

1. Exact ReactLynx / Rspeedy peer version range (lock in scaffold).
2. Is Split scroll sync required for the first tagged release?
3. Priority of nowrap mode after MVP.
