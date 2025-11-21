# @git-diff-view/lowlight

> Built-in syntax highlighter for @git-diff-view using lowlight

[![npm version](https://img.shields.io/npm/v/@git-diff-view/lowlight)](https://www.npmjs.com/package/@git-diff-view/lowlight)
[![npm downloads](https://img.shields.io/npm/dm/@git-diff-view/lowlight)](https://www.npmjs.com/package/@git-diff-view/lowlight)

This package is the **default syntax highlighter** built into [@git-diff-view/core](../core). It uses [lowlight](https://github.com/wooorm/lowlight) (highlight.js wrapper) for syntax highlighting.

## Features

- ✅ Built into @git-diff-view/core by default
- ✅ No additional installation required
- ✅ Based on highlight.js
- ✅ Supports 190+ languages
- ✅ Fast and lightweight
- ✅ Works in browser and Node.js

## Usage

No explicit setup needed - it's automatically used by @git-diff-view/core:

```typescript
import { DiffFile } from "@git-diff-view/core";

const file = new DiffFile(/* ... */);
file.init();  // Automatically uses lowlight for syntax highlighting
```

## When to Use

This is the default highlighter and suitable for most use cases. Consider [@git-diff-view/shiki](../shiki) if you need:
- More accurate syntax highlighting
- VSCode-compatible themes
- Better language grammar support

## Related Packages

- [@git-diff-view/core](https://www.npmjs.com/package/@git-diff-view/core) - Core package that includes this
- [@git-diff-view/shiki](https://www.npmjs.com/package/@git-diff-view/shiki) - Alternative highlighter
- [lowlight](https://github.com/wooorm/lowlight) - Underlying library
- [highlight.js](https://highlightjs.org/) - Language definitions

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
