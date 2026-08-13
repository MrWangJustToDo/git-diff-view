# @git-diff-view/octane

> A high-performance Octane diff view component with GitHub-style UI

[![npm version](https://img.shields.io/npm/v/@git-diff-view/octane)](https://www.npmjs.com/package/@git-diff-view/octane)

## Features

- ✅ Split & Unified views
- ✅ Syntax highlighting with full context
- ✅ Light & Dark themes
- ✅ Native Octane client and SSR builds
- ✅ Widget & extend data system
- ✅ High performance with Web Worker support

## Installation

```bash
pnpm add @git-diff-view/octane octane
```

> **Note:** this package currently requires pnpm. Its `reactivity-store` dependency is
> pinned to a git commit (`github:zhsama/reactivity-store#path:packages/r-store&...`),
> which uses pnpm's `path:` selector — npm and yarn cannot resolve it. On pnpm >= 11 you
> also need to allow the git-hosted transitive dependency, e.g. in `pnpm-workspace.yaml`:
>
> ```yaml
> blockExoticSubdeps: false
> ```

## Quick Start

### Basic Usage

```tsrx
import { DiffView, DiffModeEnum } from "@git-diff-view/octane";
import "@git-diff-view/octane/styles/diff-view.css";

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

```tsrx
import { DiffView } from "@git-diff-view/octane";
import { DiffFile, generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/octane/styles/diff-view.css";

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

```tsrx
import { DiffView } from "@git-diff-view/octane";
import { DiffFile } from "@git-diff-view/core";
import "@git-diff-view/octane/styles/diff-view.css";

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

```tsrx
// Default styles with Tailwind (next release will be pure CSS)
import "@git-diff-view/octane/styles/diff-view.css";

// Pure CSS (no Tailwind conflicts)
import "@git-diff-view/octane/styles/diff-view-pure.css";
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
| `renderWidgetLine` | `(props) => OctaneNode` | Custom widget renderer |
| `renderExtendLine` | `(props) => OctaneNode` | Custom extend data renderer |
| `extendData` | `ExtendData` | Additional data per line |
| `onAddWidgetClick` | `(lineNumber, side) => void` | Widget button click handler |

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

## Compatibility

The public `DiffView` and `DiffViewWithMultiSelect` surface mirrors `@git-diff-view/react` 0.1.7. Components use Octane refs-as-props, native browser events, and precompiled browser/server exports; no React runtime is required.

## Live Demo

Try it online: [https://mrwangjusttodo.github.io/git-diff-view](https://mrwangjusttodo.github.io/git-diff-view)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
