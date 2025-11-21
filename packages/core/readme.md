# @git-diff-view/core

> Core diff engine for git diff processing with syntax highlighting

[![npm version](https://img.shields.io/npm/v/@git-diff-view/core)](https://www.npmjs.com/package/@git-diff-view/core)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/core)](https://www.npmjs.com/package/@git-diff-view/core)

## Features

- ✅ Git diff parsing and processing
- ✅ Syntax highlighting with HAST AST
- ✅ Split & Unified view data generation
- ✅ Web Worker / Node.js compatible
- ✅ Bundle-based data transfer
- ✅ Theme support (light/dark)

## Installation

```bash
npm install @git-diff-view/core
# or
pnpm add @git-diff-view/core
# or
yarn add @git-diff-view/core
```

## Usage

### Basic Usage

```typescript
import { DiffFile } from "@git-diff-view/core";

// Create diff file instance
const file = new DiffFile(
  oldFileName,
  oldContent,
  newFileName,
  newContent,
  hunks,        // git diff hunks
  oldFileLang,  // e.g., "typescript"
  newFileLang
);

// Initialize theme (optional, default: light)
file.initTheme('dark');

// Initialize diff data
file.init();

// Build view data
file.buildSplitDiffLines();      // For split view
file.buildUnifiedDiffLines();    // For unified view
```

### Advanced: Separate Initialization

```typescript
// For more control over initialization
file.initRaw();      // Parse git diff
file.initSyntax();   // Apply syntax highlighting (optional)

file.buildSplitDiffLines();
file.buildUnifiedDiffLines();
```

### Worker/Server Pattern

Process diff data in a separate thread or server for better performance:

```typescript
// Worker/Server side - generate bundle
const file = new DiffFile(/* ... */);
file.initTheme('dark');
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

const bundle = file.getBundle();
// Send bundle to main thread/client

// Main thread/Client side - reconstruct
import { DiffFile } from "@git-diff-view/core";

const mergedFile = DiffFile.createInstance(data, bundle);

// Use with UI components
<DiffView diffFile={mergedFile} />
```

## API Reference

### DiffFile Class

#### Constructor

```typescript
new DiffFile(
  oldFileName: string,
  oldContent: string,
  newFileName: string,
  newContent: string,
  hunks: string[],
  oldFileLang?: string,
  newFileLang?: string
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `initTheme(theme)` | Set theme ('light' or 'dark') |
| `init()` | Initialize diff data (calls initRaw + initSyntax) |
| `initRaw()` | Parse git diff without syntax highlighting |
| `initSyntax()` | Apply syntax highlighting |
| `buildSplitDiffLines()` | Generate split view data |
| `buildUnifiedDiffLines()` | Generate unified view data |
| `getBundle()` | Export data for transfer |

#### Static Methods

| Method | Description |
|--------|-------------|
| `createInstance(data, bundle)` | Reconstruct DiffFile from bundle |

## Use Cases

- **Client-side**: Direct rendering with UI frameworks
- **Worker pattern**: Offload processing to Web Worker
- **Server-side**: Pre-process diffs in Node.js, send to client
- **Hybrid**: Mix of client and server processing

## Related Packages

- [@git-diff-view/react](https://www.npmjs.com/package/@git-diff-view/react) - React components
- [@git-diff-view/vue](https://www.npmjs.com/package/@git-diff-view/vue) - Vue components
- [@git-diff-view/file](https://www.npmjs.com/package/@git-diff-view/file) - File comparison mode
- [@git-diff-view/lowlight](https://www.npmjs.com/package/@git-diff-view/lowlight) - Syntax highlighter

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
