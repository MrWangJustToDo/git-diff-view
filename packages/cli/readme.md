# @git-diff-view/cli

> Terminal-based diff viewer with GitHub-style UI for CLI environments

[![npm version](https://img.shields.io/npm/v/@git-diff-view/cli)](https://www.npmjs.com/package/@git-diff-view/cli)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/cli)](https://www.npmjs.com/package/@git-diff-view/cli)

## Features

- ✅ Terminal-friendly diff rendering
- ✅ Split & Unified views in terminal
- ✅ Syntax highlighting in CLI
- ✅ Light & Dark themes
- ✅ Configurable width and display options
- ✅ Works with @git-diff-view/core and @git-diff-view/file

## Installation

```bash
npm install @git-diff-view/cli
# or
pnpm add @git-diff-view/cli
# or
yarn add @git-diff-view/cli
```

## Quick Start

### Basic Usage

```typescript
import { DiffView, DiffModeEnum } from "@git-diff-view/cli";

DiffView({
  data: {
    oldFile: { fileName: "old.ts", content: "...", fileLang: "typescript" },
    newFile: { fileName: "new.ts", content: "...", fileLang: "typescript" },
    hunks: ["..."]
  },
  diffViewMode: DiffModeEnum.Split,
  diffViewTheme: "dark",
  diffViewHighlight: true,
  width: 120  // Terminal width
});
```

### With DiffFile

**File Comparison Mode**

```typescript
import { DiffView } from "@git-diff-view/cli";
import { generateDiffFile } from "@git-diff-view/file";

const file = generateDiffFile(
  "old.ts", oldContent,
  "new.ts", newContent,
  "typescript", "typescript"
);
file.init();
file.buildSplitDiffLines();

DiffView({ diffFile: file, width: 120 });
```

**Git Diff Mode**

```typescript
import { DiffView } from "@git-diff-view/cli";
import { DiffFile } from "@git-diff-view/core";

const file = new DiffFile(
  oldFileName, oldContent,
  newFileName, newContent,
  hunks,
  oldFileLang, newFileLang
);
file.init();
file.buildSplitDiffLines();

DiffView({ diffFile: file });
```

## API Reference

### DiffView Options

| Option | Type | Description |
|--------|------|-------------|
| `data` | `DiffData` | Diff data with `oldFile`, `newFile`, and `hunks` |
| `diffFile` | `DiffFile` | Pre-processed diff file instance |
| `diffViewMode` | `Split \| Unified` | View mode (default: `Split`) |
| `diffViewTheme` | `light \| dark` | Theme (default: `light`) |
| `diffViewHighlight` | `boolean` | Enable syntax highlighting |
| `diffViewTabSpace` | `boolean` | Show tab characters |
| `diffViewTabWidth` | `small \| medium \| large` | Tab display width |
| `width` | `number` | Terminal width for rendering |
| `extendData` | `ExtendData` | Additional data per line |
| `renderExtendLine` | `Function` | Custom extend line renderer |

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

## Use Cases

- CLI diff tools
- Terminal-based code review
- Git hooks with visual diff
- CI/CD pipeline diff display
- SSH remote diff viewing
- Terminal-based editors

## Examples

```typescript
// Simple diff with custom width
DiffView({
  data: diffData,
  width: 160,
  diffViewHighlight: true
});

// Unified view in dark theme
DiffView({
  diffFile: file,
  diffViewMode: DiffModeEnum.Unified,
  diffViewTheme: "dark"
});

// With tab configuration
DiffView({
  data: diffData,
  diffViewTabSpace: true,
  diffViewTabWidth: "medium"
});
```

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Core diff engine
- [@git-diff-view/file](https://www.npmjs.com/package/@git-diff-view/file) - File comparison
- [@git-diff-view/react](https://www.npmjs.com/package/@git-diff-view/react) - React UI components
- [@git-diff-view/vue](https://www.npmjs.com/package/@git-diff-view/vue) - Vue UI components

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
