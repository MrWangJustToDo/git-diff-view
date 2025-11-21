<p align="center">
  <a href="https://mrwangjusttodo.github.io/git-diff-view">
    <img src="icon.png" alt="logo" width="180" />
  </a>
</p>

# Git Diff View

**A high-performance, feature-rich diff view component for React / Vue / Solid / Svelte**

[![Deploy](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml)
![NPM Downloads](https://img.shields.io/npm/dm/%40git-diff-view%2Fcore)
![NPM License](https://img.shields.io/npm/l/%40git-diff-view%2Fcore)

## ✨ Highlights

- 🎨 **Full Syntax Highlighting** - Complete syntax context based on HAST AST
- ⚡ **High Performance** - Web Worker & Node Server support, template mode optimization
- 🎯 **Framework Agnostic** - React, Vue, Solid, Svelte, and CLI support
- 🔧 **Highly Customizable** - Widgets, extend data, themes, and flexible rendering
- 📦 **Multiple Modes** - Git diff or file comparison with Split/Unified views
- 🌗 **SSR/RSC Ready** - Full server-side rendering and React Server Components support

## 🎮 Live Demo

Try it online: [Git Mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=git) · [File Mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=file) · [GitHub Style](https://mrwangjusttodo.github.io/MrWangJustToDo.io?overlay=open&playGround=GitHub)

![git mode](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/gitMode.png)

<details>
<summary>📸 More Screenshots</summary>

![file mode](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/fileMode.png)
![theme support](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/theme.png)
![unified view](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/69c801e5eb5fcabc9c9655825eb1228f18dc1e0c/5.png)

</details>

## 📦 Installation

```bash
# React
pnpm add @git-diff-view/react

# Vue
pnpm add @git-diff-view/vue

# Solid / Svelte
pnpm add @git-diff-view/solid
pnpm add @git-diff-view/svelte
```

**[View Examples](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui)** for React / Vue / Solid / Svelte

## 🚀 Quick Start

### React

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";

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
```

### Advanced Usage

```tsx
import { DiffFile, generateDiffFile } from "@git-diff-view/file";

// File comparison mode
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

**More examples:** [React](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/react-example) · [Vue](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/vue-example) · [Solid](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/solid-example)

## 📚 Packages

**UI Frameworks**
- [`@git-diff-view/react`](https://www.npmjs.com/package/@git-diff-view/react) - React component
- [`@git-diff-view/vue`](https://www.npmjs.com/package/@git-diff-view/vue) - Vue component
- [`@git-diff-view/solid`](https://www.npmjs.com/package/@git-diff-view/solid) - Solid component
- [`@git-diff-view/svelte`](https://www.npmjs.com/package/@git-diff-view/svelte) - Svelte component
- [`@git-diff-view/cli`](https://www.npmjs.com/package/@git-diff-view/cli) - CLI tool

**Core Libraries**
- [`@git-diff-view/core`](https://www.npmjs.com/package/@git-diff-view/core) - Core diff engine (git diff)
- [`@git-diff-view/file`](https://www.npmjs.com/package/@git-diff-view/file) - File comparison engine

**Syntax Highlighters**
- [`@git-diff-view/lowlight`](https://www.npmjs.com/package/@git-diff-view/lowlight) - Built-in highlighter
- [`@git-diff-view/shiki`](https://www.npmjs.com/package/@git-diff-view/shiki) - Shiki integration

## 🎯 Key Features

- ✅ **Split & Unified Views** - Switch between side-by-side and unified diff modes
- ✅ **Full Syntax Highlighting** - Complete context-aware syntax highlighting with HAST AST
- ✅ **Light & Dark Themes** - Built-in theme support with customization
- ✅ **Line Wrapping** - Toggle line wrapping for long code lines
- ✅ **Widget System** - Add custom interactive widgets to diff lines
- ✅ **Extend Data** - Attach and render custom data per line
- ✅ **Web Worker Support** - Offload processing for better performance
- ✅ **SSR & RSC** - Full server-side rendering support for React and Vue
- ✅ **Diff Match Patch** - Enhanced line-level diff with FastDiff template (experimental)
- ✅ **Multiple Platforms** - React, Vue, Solid, Svelte, and CLI

## ⚡ Advanced Features

### FastDiff Template (Experimental)

Enhanced line-by-line diff visualization for better readability.

```ts
import { setEnableFastDiffTemplate } from '@git-diff-view/core';

setEnableFastDiffTemplate(true);
```

| Default | FastDiff |
|---------|----------|
| ![default](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/main/default.png) | ![fastdiff](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/main/enableFastDiffTemplate.png) |

### Template Mode

Optimized rendering mode enabled by default for better performance. [Learn more](https://github.com/MrWangJustToDo/git-diff-view/blob/main/packages/core/src/parse/template.ts)

## 📖 API Reference

### Component Props

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
| `renderWidgetLine` | `Function` | Custom widget renderer |
| `renderExtendLine` | `Function` | Custom extend data renderer |
| `extendData` | `ExtendData` | Additional data per line |
| `onAddWidgetClick` | `Function` | Widget button click handler |

### Styling

```tsx
// Default styles with Tailwind
import "@git-diff-view/react/styles/diff-view.css";

// Pure CSS (no Tailwind conflicts)
import "@git-diff-view/react/styles/diff-view-pure.css";
```

### Two Usage Modes

**1. Direct Data Mode** - Pass raw diff data
```tsx
<DiffView data={{ oldFile, newFile, hunks }} />
```

**2. DiffFile Instance Mode** - Pre-process for better control
```tsx
const file = new DiffFile(/* ... */);
file.init();
file.buildSplitDiffLines();
<DiffView diffFile={file} />
```

## 🛠️ Development

```bash
git clone https://github.com/MrWangJustToDo/git-diff-view.git
cd git-diff-view
pnpm install
pnpm run build:packages
pnpm run dev:react  # or dev:vue, dev:solid, dev:svelte
```

## 📄 License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
