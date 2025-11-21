# @git-diff-view/react

> A high-performance React diff view component with GitHub-style UI

[![npm version](https://img.shields.io/npm/v/@git-diff-view/react)](https://www.npmjs.com/package/@git-diff-view/react)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/react)](https://www.npmjs.com/package/@git-diff-view/react)

## Features

- ✅ Split & Unified views
- ✅ Syntax highlighting with full context
- ✅ Light & Dark themes
- ✅ SSR & RSC support
- ✅ Widget & extend data system
- ✅ High performance with Web Worker support

## Installation

```bash
npm install @git-diff-view/react
# or
pnpm add @git-diff-view/react
# or
yarn add @git-diff-view/react
```

## Quick Start

### Basic Usage

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";

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
import { DiffView } from "@git-diff-view/react";
import { DiffFile, generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/react/styles/diff-view.css";

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
import { DiffView } from "@git-diff-view/react";
import { DiffFile } from "@git-diff-view/core";
import "@git-diff-view/react/styles/diff-view.css";

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
import "@git-diff-view/react/styles/diff-view.css";

// Pure CSS (no Tailwind conflicts)
import "@git-diff-view/react/styles/diff-view-pure.css";
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
| `renderWidgetLine` | `(props) => ReactNode` | Custom widget renderer |
| `renderExtendLine` | `(props) => ReactNode` | Custom extend data renderer |
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

- [Basic React Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/react-example)
- [Next.js SSR Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/next-page-example)
- [Next.js RSC Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/next-app-example)

## Live Demo

Try it online: [https://mrwangjusttodo.github.io/git-diff-view](https://mrwangjusttodo.github.io/git-diff-view)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
