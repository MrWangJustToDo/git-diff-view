# @git-diff-view/svelte

> A high-performance Svelte diff view component with GitHub-style UI

[![npm version](https://img.shields.io/npm/v/@git-diff-view/svelte)](https://www.npmjs.com/package/@git-diff-view/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/svelte)](https://www.npmjs.com/package/@git-diff-view/svelte)

## Features

- ✅ Split & Unified views
- ✅ Syntax highlighting with full context
- ✅ Light & Dark themes
- ✅ Svelte 4+ support with Snippets
- ✅ Widget & extend data system with snippets
- ✅ High performance with Web Worker support

## Installation

```bash
npm install @git-diff-view/svelte
# or
pnpm add @git-diff-view/svelte
# or
yarn add @git-diff-view/svelte
```

## Quick Start

### Basic Usage

```svelte
<script>
  import { DiffView, DiffModeEnum } from "@git-diff-view/svelte";
  import "@git-diff-view/svelte/styles/diff-view.css";

  const diffData = {
    oldFile: { fileName: "old.ts", content: "..." },
    newFile: { fileName: "new.ts", content: "..." },
    hunks: ["..."]
  };
</script>

<DiffView
  data={diffData}
  diffViewMode={DiffModeEnum.Split}
  diffViewTheme="dark"
  diffViewHighlight={true}
/>
```

### Advanced Usage with DiffFile

**File Comparison Mode**

```svelte
<script>
  import { DiffView } from "@git-diff-view/svelte";
  import { DiffFile, generateDiffFile } from "@git-diff-view/file";
  import "@git-diff-view/svelte/styles/diff-view.css";

  const file = generateDiffFile(
    "old.ts", oldContent,
    "new.ts", newContent,
    "typescript", "typescript"
  );
  file.initTheme('dark');
  file.init();
  file.buildSplitDiffLines();
</script>

<DiffView diffFile={file} />
```

**Git Diff Mode**

```svelte
<script>
  import { DiffView } from "@git-diff-view/svelte";
  import { DiffFile } from "@git-diff-view/core";
  import "@git-diff-view/svelte/styles/diff-view.css";

  const file = new DiffFile(
    oldFileName,
    oldContent,
    newFileName,
    newContent,
    hunks,
    oldFileLang,
    newFileLang
  );
  file.initTheme('dark');
  file.init();
  file.buildSplitDiffLines();
</script>

<DiffView diffFile={file} />
```

## Styling

```svelte
<script>
  // Default styles with Tailwind (next release will be pure CSS)
  import "@git-diff-view/svelte/styles/diff-view.css";

  // Pure CSS (no Tailwind conflicts)
  import "@git-diff-view/svelte/styles/diff-view-pure.css";
</script>
```

## API Reference

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `DiffData` | Diff data with `oldFile`, `newFile`, and `hunks` |
| `diffFile` | `DiffFile` | Pre-processed diff file instance |
| `diffViewMode` | `Split \| Unified` | View mode (default: `Split`) |
| `diffViewTheme` | `light \| dark` | Theme (default: `light`) |
| `diffViewHighlight` | `boolean` | Enable syntax highlighting |
| `diffViewWrap` | `boolean` | Enable line wrapping |
| `diffViewFontSize` | `number` | Font size in pixels |
| `diffViewAddWidget` | `boolean` | Enable widget button |
| `extendData` | `ExtendData` | Additional data per line |
| `renderWidgetLine` | `Snippet` | Custom widget snippet |
| `renderExtendLine` | `Snippet` | Custom extend data snippet |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onAddWidgetClick` | `{ side, lineNumber }` | Fired when widget button is clicked |

### DiffData Type

```typescript
type DiffData = {
  oldFile?: {
    fileName?: string | null;
    fileLang?: string | null;
    content?: string | null;
  };
  newFile?: {
    fileName?: string | null;
    fileLang?: string | null;
    content?: string | null;
  };
  hunks: string[];
};
```

## Examples

- [Svelte Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/packages/svelte)

## Live Demo

Try it online: [https://mrwangjusttodo.github.io/git-diff-view](https://mrwangjusttodo.github.io/git-diff-view)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
