# @git-diff-view/vue

> A high-performance Vue diff view component with GitHub-style UI

[![npm version](https://img.shields.io/npm/v/@git-diff-view/vue)](https://www.npmjs.com/package/@git-diff-view/vue)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/vue)](https://www.npmjs.com/package/@git-diff-view/vue)

## Features

- ✅ Split & Unified views
- ✅ Syntax highlighting with full context
- ✅ Light & Dark themes
- ✅ SSR support
- ✅ Vue 3 composition API
- ✅ Widget & extend data system with slots
- ✅ High performance with Web Worker support

## Installation

```bash
npm install @git-diff-view/vue
# or
pnpm add @git-diff-view/vue
# or
yarn add @git-diff-view/vue
```

## Quick Start

### Basic Usage

```vue
<script setup>
import { DiffView, DiffModeEnum } from "@git-diff-view/vue";
import "@git-diff-view/vue/styles/diff-view.css";

const diffData = {
  oldFile: { fileName: "old.ts", content: "..." },
  newFile: { fileName: "new.ts", content: "..." },
  hunks: ["..."]
};
</script>

<template>
  <DiffView
    :data="diffData"
    :diff-view-mode="DiffModeEnum.Split"
    diff-view-theme="dark"
    :diff-view-highlight="true"
  />
</template>
```

### Advanced Usage with DiffFile

**File Comparison Mode**

```vue
<script setup>
import { DiffView } from "@git-diff-view/vue";
import { DiffFile, generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/vue/styles/diff-view.css";

const file = generateDiffFile(
  "old.ts", oldContent,
  "new.ts", newContent,
  "typescript", "typescript"
);
file.initTheme('dark');
file.init();
file.buildSplitDiffLines();
</script>

<template>
  <DiffView :diff-file="file" />
</template>
```

**Git Diff Mode**

```vue
<script setup>
import { DiffView } from "@git-diff-view/vue";
import { DiffFile } from "@git-diff-view/core";
import "@git-diff-view/vue/styles/diff-view.css";

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

<template>
  <DiffView :diff-file="file" />
</template>
```

## Styling

```vue
<script>
// Default styles with Tailwind (next release will be pure CSS)
import "@git-diff-view/vue/styles/diff-view.css";

// Pure CSS (no Tailwind conflicts)
import "@git-diff-view/vue/styles/diff-view-pure.css";
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

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `widget` | `{ onClose, side, lineNumber }` | Custom widget content |
| `extend` | `{ data }` | Custom extend data content |

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

- [Basic Vue Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/vue-example)
- [Vue SSR Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/vue-ssr-example)

## Live Demo

Try it online: [https://mrwangjusttodo.github.io/git-diff-view](https://mrwangjusttodo.github.io/git-diff-view)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
