# Scroll API — Implementation Guide

Shared scroll types and utilities live in `src/components/scroll.ts`.

## Status

| Component | Scroll API | Layout | Rendering |
|-----------|------------|--------|-----------|
| **CodeView** | ✅ | `buildCodeViewLayout` | Single sliced ANSI `<Text>` |
| **DiffView** | ✅ | `iterateDiffDisplayEntries` → `buildDiffViewScrollLayout` | `DiffDisplayList` virtual slice |

---

## Shared Concepts

### Logical line vs visual row

| Term | Meaning |
|------|---------|
| **Logical line (`line`)** | User-facing line index (1-based). API methods use this. |
| **Visual row (`row`)** | Terminal row after wrap. Internal scroll offset is row-based. |

A logical line may span multiple visual rows when content exceeds `contentWidth`.

### `ScrollState`

```typescript
type ScrollState = {
  totalLines: number;
  totalRows: number;
  viewportHeight: number;
  scrollOffset: number;
  startLine: number;
  endLine: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
};
```

**Partially visible lines:** If the viewport top falls inside line 42's second wrap segment, `startLine` is still `42`.

---

## CodeView

### Line semantics

- `line` = source file line number (`File.rawFile`, 1..`rawLength`).
- Layout built in `buildCodeViewLayout()` alongside ANSI rendering.

### Rendering

When `height` is set:

1. Build full `ScrollLayout` in `useMemo`.
2. `useScrollView` maintains `scrollOffset` and slices `layout.rows`.
3. Render sliced ANSI string in `<Box height={height} overflow="hidden">`.

When `height` is unset, all rows render.

---

## DiffView

### Architecture

```
iterateDiffDisplayEntries()     ← single source of display sequence
        ├── buildDiffViewScrollLayout()   (row counts for scroll)
        └── DiffDisplayList()             (render all or visible slice)
                └── DiffDisplayEntry()    (hunk / content / extend)
```

`DiffUnifiedView` / `DiffSplitView` / `DiffScrollEntryView` were merged into `DiffDisplayList` + `DiffDisplayEntry`.

### Line semantics

`line` = **1-based index in the flattened display sequence**:

1. **Hunk line** (when `mapIndex !== 0` and hunk should show) — 1 visual row
2. **Content line** — 1+ visual rows (wrap)
3. **Extend line** — `diffViewExtendLineHeight` visual rows (when `renderExtendLine` + `extendData` present)

The **first content block never has a leading hunk line** (matches pre-scroll rendering).

Example sequence for 3 diff entries:

```
line 1: Content(index=0)
line 2: Hunk + Content + Extend(index=1)
line 3: Hunk + Content + Extend(index=2)
```

### Rendering

When `height` is set:

1. `buildDiffViewScrollLayout` walks `iterateDiffDisplayEntries` and records row offsets.
2. `useScrollView` + `getVisibleDiffScrollLines` produce visible entries with optional `clip` (`ScrollSlice`).
3. `DiffDisplayList` renders only visible entries inside `<Box height={height} overflow="hidden">`.

When `height` is unset:

- `buildDiffViewScrollLayout` is **skipped** (`EMPTY_DIFF_VIEW_SCROLL_LAYOUT`).
- `DiffDisplayList` iterates all entries via `iterateDiffDisplayEntries` (full render).

### Extend line height

Extend lines are custom React nodes. Scroll layout uses `diffViewExtendLineHeight` (default `1`). Top clipping for multi-row extend UI is approximate.

### Width / layout changes

`resetKey` (`columns:mode`) resets scroll offset to `0` when width or view mode changes.

### Exported utilities (`diffViewScroll.ts`)

| Export | Purpose |
|--------|---------|
| `iterateDiffDisplayEntries` | Walk hunk/content/extend display sequence |
| `buildDiffViewScrollLayout` | Build scroll layout from iterator |
| `getVisibleDiffScrollLines` | Map scroll offset → visible entries + clip |
| `getDiffDisplayEntryRowCount` | Row count for one display entry |
| `getUnifiedContentRowCount` / `getSplitContentRowCount` | Content wrap row counts |

---

## Pure functions (`scroll.ts`)

| Function | Purpose |
|----------|---------|
| `getEffectiveViewportHeight` | `min(height, totalRows)` for shrink-to-content viewport |
| `computeScrollState` | Derive `ScrollState` from layout + offset |
| `scrollOffsetToTopLine` | Target offset for `scrollToTop` |
| `scrollOffsetToBottomLine` | Target offset for `scrollToBottom` |
| `scrollOffsetUp` / `scrollOffsetDown` | Step scrolling |
| `sliceVisibleRows` | Join visible ANSI rows (CodeView) |
| `useScrollView` | Hook: state + ref API + `onScrollChange` |

---

## Testing

Build first: `pnpm run build:packages`

```bash
pnpm --filter @git-diff-view/cli test:scroll
pnpm --filter @git-diff-view/cli test:scroll:interactive
pnpm --filter @git-diff-view/cli test:scroll:interactive:diffview
```

See `test/scroll/README.md` for coverage details.
