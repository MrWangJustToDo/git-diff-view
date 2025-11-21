# @git-diff-view/solid

> A high-performance Solid diff view component with GitHub-style UI

[![npm version](https://img.shields.io/npm/v/@git-diff-view/solid)](https://www.npmjs.com/package/@git-diff-view/solid)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/solid)](https://www.npmjs.com/package/@git-diff-view/solid)

## Features

- ✅ Split & Unified views
- ✅ Syntax highlighting with full context
- ✅ Light & Dark themes
- ✅ Solid's fine-grained reactivity
- ✅ Widget & extend data system
- ✅ High performance with Web Worker support

## Installation

```bash
npm install @git-diff-view/solid
# or
pnpm add @git-diff-view/solid
# or
yarn add @git-diff-view/solid
```

## Quick Start

### Basic Usage

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/solid";
import "@git-diff-view/solid/styles/diff-view.css";

function MyDiffView() {
  return (
    <DiffView
      data={{
        oldFile: { fileName: "old.ts", content: "..." },
        newFile: { fileName: "new.ts", content: "..." },
        hunks: ["..."]
      }}
      diffViewMode={DiffModeEnum.Split}
      diffViewTheme="dark"
      diffViewHighlight
    />
  );
}
```

### Advanced Usage with DiffFile

**File Comparison Mode**

```tsx
import { DiffView } from "@git-diff-view/solid";
import { DiffFile, generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/solid/styles/diff-view.css";

const file = generateDiffFile(
  "old.ts", oldContent,
  "new.ts", newContent,
  "typescript", "typescript"
);
file.initTheme('dark');
file.init();
file.buildSplitDiffLines();

<DiffView diffFile={file} />
```

**Git Diff Mode**

```tsx
import { DiffView } from "@git-diff-view/solid";
import { DiffFile } from "@git-diff-view/core";
import "@git-diff-view/solid/styles/diff-view.css";

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

<DiffView diffFile={file} />
```

## Styling

```tsx
// Default styles with Tailwind (next release will be pure CSS)
import "@git-diff-view/solid/styles/diff-view.css";

// Pure CSS (no Tailwind conflicts)
import "@git-diff-view/solid/styles/diff-view-pure.css";
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
| `renderWidgetLine` | `(props) => JSXElement` | Custom widget renderer |
| `renderExtendLine` | `(props) => JSXElement` | Custom extend data renderer |
| `extendData` | `ExtendData` | Additional data per line |
| `onAddWidgetClick` | `(props) => void` | Widget button click handler |

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

- [Solid Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/solid-example)

## Live Demo

Try it online: [https://mrwangjusttodo.github.io/git-diff-view](https://mrwangjusttodo.github.io/git-diff-view)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
