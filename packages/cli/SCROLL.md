# Scroll API — Implementation Guide

Shared scroll types and utilities live in `src/components/scroll.ts`.

## Status

| Component | Scroll API | Layout builder | Viewport slice |
|-----------|------------|----------------|----------------|
| **CodeView** | ✅ Implemented | `buildCodeViewLayout` | ✅ |
| **DiffView** | ✅ Implemented | `iterateDiffDisplayEntries` → `buildDiffViewScrollLayout` | ✅ `DiffDisplayList` virtual slice |

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
  totalLines: number;      // logical line count
  totalRows: number;       // visual row count after wrap
  viewportHeight: number;  // fixed height prop, or totalRows when unset
  scrollOffset: number;    // top visual row (0-based)
  startLine: number;       // first visible logical line (includes clipped lines)
  endLine: number;         // last visible logical line (includes clipped lines)
  canScrollUp: boolean;
  canScrollDown: boolean;
};
```

**Partially visible lines:** If the viewport top falls inside line 42's second wrap segment, `startLine` is still `42`.

---

## CodeView (done)

### Line semantics

- `line` = source file line number (`File.rawFile`, 1..`rawLength`).
- Layout built in `buildCodeViewLayout()` alongside existing ANSI rendering.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `height` | `number` | Viewport height in visual rows |
| `onScrollChange` | `(state: ScrollState) => void` | Fires when scroll state changes |

### Ref (`CodeViewRef`)

Extends `ScrollViewRef`:

| Method | Description |
|--------|-------------|
| `getScrollState()` | Current snapshot |
| `scrollToTop(line)` | Align logical line's first visual row to viewport top |
| `scrollToBottom(line)` | Align logical line's last visual row to viewport bottom |
| `scrollUp({ unit?, step? })` | Scroll up one visual or logical step |
| `scrollDown({ unit?, step? })` | Scroll down one visual or logical step |
| `getFileInstance()` | Existing API |

### Rendering

When `height` is set:

1. Build full `ScrollLayout` in `useMemo`.
2. `useScrollView` maintains `scrollOffset` and slices `layout.rows`.
3. Render sliced ANSI string in `<Box height={height} overflow="hidden">`.

When `height` is unset, all rows render (backward compatible). DiffView skips `buildDiffViewScrollLayout` entirely in that case (uses `EMPTY_SCROLL_LAYOUT`); only the original full render path runs.

### Width / layout changes

When render width (`columns`) changes, wrap counts change and row indices no longer match the previous layout. Both CodeView and DiffView pass a `resetKey` into `useScrollView` so **scroll offset resets to 0** on width change. DiffView also includes `mode` in the reset key (split ↔ unified).

---

## DiffView (TODO)

### Line semantics (方案 1 — confirmed)

`line` = **1-based index in the flattened display sequence**, including:

1. **Hunk line** (when `index !== 0`) — always 1 visual row
2. **Content line** — 1+ visual rows (wrap)
3. **Extend line** — height from `renderExtendLine` (0 if not rendered)

Both **Split** and **Unified** modes use the same scroll sequence shape; only the content of each entry differs.

Example unified sequence for 3 diff entries:

```
line 1: ContentLine(index=0)
line 2: HunkLine + ContentLine + ExtendLine(index=1)
line 3: HunkLine + ContentLine + ExtendLine(index=2)
```

Each numbered item above is one **scroll logical line** with its own `startRow`/`endRow`.

### Implementation checklist

- [ ] **`buildDiffViewLayout(diffFile, mode, columns, context)`**
  - Walk `getUnifiedContentLine` / `getSplitContentLines` same as views.
  - For each index, append hunk (if any), content, extend entries to `lines[]`.
  - Compute visual row count per entry:
    - Hunk: `1`
    - Content: reuse `getCurrentLineRow` / `splitCharsIntoRows` (must match `DiffContent` wrap width)
    - Extend: measure rendered extend node height (may need ref or pre-render estimate)
  - Store pre-rendered ANSI rows OR React node keys for slice rendering.

- [ ] **Rendering strategy**

  DiffView currently renders per-line React components, not a single ANSI string. Two options:

  | Option | Pros | Cons |
  |--------|------|------|
  | **A. Virtual slice** | Keeps component structure | Only mount visible lines; extend/hunk logic stays in components |
  | **B. ANSI layout** | Same as CodeView | Hard for extend lines + interactive extend UI |

  **Recommended: Option A — virtual slice**

  ```
  visibleLines = layout.lines.slice(startLine - 1, endLine)
  render only those Diff*Line components
  ```

  Wrap in `<Box height={height} overflow="hidden">`.

- [ ] **Wire `useScrollView`** in `DiffViewContainerWithRef` or `InternalDiffView`.

- [ ] **Replace stub** in `createDiffViewScrollStub` with real ref from `useScrollView`.

- [ ] **`onScrollChange`** — same as CodeView via `useScrollView`.

- [ ] **Extend line height**

  Extend lines are custom React nodes. Options:
  - Require `renderExtendLine` to return fixed-height content, or
  - Accept `extendLineHeight` prop for scroll calculation, or
  - Measure after first render and update layout (complex).

- [ ] **Dynamic updates**

  When `diffFile.notifyAll()` fires (syntax highlight, extend update):
  - Rebuild layout
  - Clamp `scrollOffset`
  - Optionally anchor to current `startLine`

- [ ] **Split vs Unified mode switch**

  Reset scroll offset when mode changes.

### Stub behavior (current)

Until implemented:

- Ref scroll methods log `__DEV__` warning pointing to this doc.
- `getScrollState()` returns empty layout with `totalLines: diffFile.splitLineLength` (approximate).
- `onScrollChange` fires once on mount with stub state.

---

## Pure functions (`scroll.ts`)

| Function | Purpose |
|----------|---------|
| `computeScrollState` | Derive `ScrollState` from layout + offset |
| `scrollOffsetToTopLine` | Target offset for `scrollToTop` |
| `scrollOffsetToBottomLine` | Target offset for `scrollToBottom` |
| `scrollOffsetUp` / `scrollOffsetDown` | Step scrolling |
| `sliceVisibleRows` | Join visible ANSI rows |
| `useScrollView` | Hook: state + ref API + `onScrollChange` |

---

## Testing (manual)

CodeView:

```tsx
const ref = useRef<CodeViewRef>(null);

<CodeView ref={ref} height={20} file={file} onScrollChange={console.log} />;

ref.current?.scrollToTop(100);
ref.current?.scrollDown({ unit: "logical" });
console.log(ref.current?.getScrollState());
```

Verify:

- [ ] Long line wrap: `startLine` stays on logical line when top segment clipped
- [ ] `scrollToBottom` on wrapped line shows last segment at bottom
- [ ] `scrollUp/Down` with `unit: "logical"` vs `"visual"`
- [ ] Width change reclamps offset
- [ ] Without `height`, full content visible, scroll still updates offset
