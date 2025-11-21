# @git-diff-view/file

> File content comparison engine built on top of @git-diff-view/core

[![npm version](https://img.shields.io/npm/v/@git-diff-view/file)](https://www.npmjs.com/package/@git-diff-view/file)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/file)](https://www.npmjs.com/package/@git-diff-view/file)

Compare two file contents directly without git diff hunks. This package wraps [`diff`](https://github.com/kpdecker/jsdiff) and `@git-diff-view/core` to provide easy file-to-file comparison.

## Features

- ✅ Direct file content comparison (no git required)
- ✅ Automatic diff generation using `diff` library
- ✅ Same API as @git-diff-view/core
- ✅ Syntax highlighting with HAST AST
- ✅ Split & Unified view support
- ✅ Theme support (light/dark)

## Installation

```bash
npm install @git-diff-view/file
# or
pnpm add @git-diff-view/file
# or
yarn add @git-diff-view/file
```

## Usage

### Basic Usage

```typescript
import { generateDiffFile } from "@git-diff-view/file";

// Generate diff from file contents
const file = generateDiffFile(
  "old.ts",      // old file name
  oldContent,    // old file content
  "new.ts",      // new file name
  newContent,    // new file content
  "typescript",  // old file language
  "typescript"   // new file language
);

// Initialize theme
file.initTheme('dark');

// Initialize diff
file.init();

// Build views
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();
```

### Worker/Server Pattern

```typescript
// Worker/Server side
import { generateDiffFile, DiffFile } from "@git-diff-view/file";

const file = generateDiffFile(
  oldFileName, oldContent,
  newFileName, newContent,
  oldLang, newLang
);

file.initTheme('dark');
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

const bundle = file.getBundle();
// Send bundle to main thread/client

// Main thread/Client side
const mergedFile = DiffFile.createInstance(data, bundle);

// Use with UI components
<DiffView diffFile={mergedFile} />
```

## API Reference

### generateDiffFile()

Generate a DiffFile instance from file contents.

```typescript
function generateDiffFile(
  oldFileName: string,
  oldContent: string,
  newFileName: string,
  newContent: string,
  oldFileLang?: string,
  newFileLang?: string
): DiffFile
```

### DiffFile Methods

Same as [@git-diff-view/core](../core#api-reference):

| Method | Description |
|--------|-------------|
| `initTheme(theme)` | Set theme ('light' or 'dark') |
| `init()` | Initialize diff data |
| `buildSplitDiffLines()` | Generate split view data |
| `buildUnifiedDiffLines()` | Generate unified view data |
| `getBundle()` | Export data for transfer |

## Difference from @git-diff-view/core

| Package | Use Case | Input |
|---------|----------|-------|
| `@git-diff-view/core` | Git diff visualization | Git diff hunks |
| `@git-diff-view/file` | File comparison | Raw file contents |

## Use Cases

- Compare file versions without git
- Diff editor integration
- Online code comparison tools
- File upload comparison
- Live code diff

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Git diff mode
- [@git-diff-view/react](https://www.npmjs.com/package/@git-diff-view/react) - React components
- [@git-diff-view/vue](https://www.npmjs.com/package/@git-diff-view/vue) - Vue components
- [diff](https://github.com/kpdecker/jsdiff) - Underlying diff library

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
