# @git-diff-view/cli

> Terminal-based diff viewer with GitHub-style UI for CLI environments

[![npm version](https://img.shields.io/npm/v/@git-diff-view/cli)](https://www.npmjs.com/package/@git-diff-view/cli)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/cli)](https://www.npmjs.com/package/@git-diff-view/cli)

![CLI Diff View](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/main/cli-diff.png)

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

### DiffView Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `DiffData` | Diff data with `oldFile`, `newFile`, and `hunks` |
| `diffFile` | `DiffFile` | Pre-processed diff file instance |
| `diffViewMode` | `DiffModeEnum` | View mode (default: `SplitGitHub`) |
| `diffViewTheme` | `"light" \| "dark"` | Theme (default: `"light"`) |
| `diffViewHighlight` | `boolean` | Enable syntax highlighting |
| `diffViewTabSpace` | `boolean` | Show tab/space characters |
| `diffViewTabWidth` | `"small" \| "medium" \| "large"` | Tab display width (default: `"medium"`) |
| `diffViewHideOperator` | `boolean` | Hide the `+`/`-`/` ` operator column |
| `diffViewNoBG` | `boolean` | Disable neutral background colors for transparent terminals |
| `diffViewThemeColors` | `DiffViewColorTheme` | Custom color overrides (see [Theme Customization](#theme-customization)) |
| `width` | `number` | Fixed terminal width for rendering |
| `extendData` | `ExtendData` | Additional data per line |
| `renderExtendLine` | `Function` | Custom extend line renderer |

### CodeView Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `{ content: string; fileName?: string; fileLang?: string }` | Source file data |
| `file` | `File` | Pre-processed file instance |
| `codeViewTheme` | `"light" \| "dark"` | Theme (default: `"light"`) |
| `codeViewHighlight` | `boolean` | Enable syntax highlighting |
| `codeViewTabSpace` | `boolean` | Show tab/space characters |
| `codeViewTabWidth` | `"small" \| "medium" \| "large"` | Tab display width (default: `"medium"`) |
| `codeViewNoBG` | `boolean` | Disable neutral background colors for transparent terminals |
| `codeViewThemeColors` | `DiffViewColorTheme` | Custom color overrides (see [Theme Customization](#theme-customization)) |
| `width` | `number` | Fixed terminal width for rendering |
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

## Theme Customization

You can override any color token via `diffViewThemeColors` / `codeViewThemeColors`. All fields are optional — unset keys fall back to the built-in GitHub-style defaults.

```typescript
import type { DiffViewColorTheme } from "@git-diff-view/cli";

const myTheme: DiffViewColorTheme = {
  addContent: { light: "#d4edda", dark: "#1b4332" },
  delContent: { light: "#f8d7da", dark: "#3d0f0f" },
  addContentHighlight: { light: "#a3d9a5", dark: "#2d6a4f" },
  delContentHighlight: { light: "#f1aeb5", dark: "#6c1e1e" },
};
```

```tsx
<DiffView
  diffFile={file}
  diffViewMode={DiffModeEnum.Unified}
  diffViewTheme="dark"
  diffViewThemeColors={myTheme}
/>
```

### Available Color Tokens

| Token | Description |
|-------|-------------|
| `addContent` | Background for added lines |
| `delContent` | Background for deleted lines |
| `plainContent` | Background for unchanged lines |
| `expandContent` | Background for expand/context lines |
| `emptyContent` | Background for empty placeholder areas |
| `addLineNumber` | Line number background for added lines |
| `delLineNumber` | Line number background for deleted lines |
| `plainLineNumber` | Line number background for unchanged lines |
| `expandLineNumber` | Line number background for expand lines |
| `hunkLineNumber` | Hunk header line number background |
| `plainLineNumberColor` | Line number text color for unchanged lines |
| `expandLineNumberColor` | Line number text color for expand lines |
| `hunkContentColor` | Hunk header text color |
| `addContentHighlight` | Inline change highlight for added text |
| `delContentHighlight` | Inline change highlight for deleted text |
| `hunkContent` | Hunk header background |
| `border` | Border color |
| `noBGAddContent` | Stronger add background when `noBG` is enabled |
| `noBGDelContent` | Stronger delete background when `noBG` is enabled |
| `noBGAddLineNumber` | Stronger add line number background when `noBG` is enabled |
| `noBGDelLineNumber` | Stronger delete line number background when `noBG` is enabled |
| `noBGAddContentHighlight` | Stronger add highlight when `noBG` is enabled |
| `noBGDelContentHighlight` | Stronger delete highlight when `noBG` is enabled |

Each token is `{ light: string; dark: string }` — hex color strings for each theme variant.

## Use Cases

- CLI diff tools
- Terminal-based code review
- Git hooks with visual diff
- CI/CD pipeline diff display
- SSH remote diff viewing
- Terminal-based editors

## Examples

```tsx
// Simple diff with custom width
<DiffView data={diffData} width={160} diffViewHighlight={true} />

// Unified view in dark theme
<DiffView
  diffFile={file}
  diffViewMode={DiffModeEnum.Unified}
  diffViewTheme="dark"
/>

// Transparent terminal with no background colors
<DiffView
  data={diffData}
  diffViewNoBG={true}
  diffViewTheme="dark"
/>

// With custom theme colors
<DiffView
  data={diffData}
  diffViewThemeColors={{
    addContent: { light: "#d4edda", dark: "#1b4332" },
    delContent: { light: "#f8d7da", dark: "#3d0f0f" },
  }}
/>

// CodeView for single file rendering
<CodeView
  data={{ content: sourceCode, fileLang: "typescript" }}
  codeViewTheme="dark"
  codeViewHighlight={true}
/>
```

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Core diff engine
- [@git-diff-view/file](https://www.npmjs.com/package/@git-diff-view/file) - File comparison
- [@git-diff-view/react](https://www.npmjs.com/package/@git-diff-view/react) - React UI components
- [@git-diff-view/vue](https://www.npmjs.com/package/@git-diff-view/vue) - Vue UI components

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
