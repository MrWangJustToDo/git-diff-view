<p align="center">
  <a href="https://mrwangjusttodo.github.io/git-diff-view">
    <img src="icon.png" alt="logo" width="180" />
  </a>
</p>

# Git Diff Component

A Diff view component for React / Vue / Solid / Svelte,
The most one component what easy to use and feature complete.

[![Deploy](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml)
![NPM Downloads](https://img.shields.io/npm/dm/%40git-diff-view%2Fcore)
![NPM License](https://img.shields.io/npm/l/%40git-diff-view%2Fcore)

## Demo ---- git-diff / file-diff
[git-mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=git)

![git mode](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/gitMode.png)

[file-mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=file)

![file mode](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/fileMode.png)

[GitHub compare](https://mrwangjusttodo.github.io/MrWangJustToDo.io?overlay=open&playGround=GitHub)

![GitHub compare](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/4.png)

## How to use （React / Vue / Solid / Svelte）

See example project [Example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui)

## Packages

| Package                                  | Version                                                                                                                    |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [`@git-diff-view/core`](packages/core)   | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/core)](https://www.npmjs.com/package/@git-diff-view/core)   |
| [`@git-diff-view/file`](packages/file)   | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/file)](https://www.npmjs.com/package/@git-diff-view/file)   |
| [`@git-diff-view/react`](packages/react) | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/react)](https://www.npmjs.com/package/@git-diff-view/react) |
| [`@git-diff-view/vue`](packages/vue)     | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/vue)](https://www.npmjs.com/package/@git-diff-view/vue)     |
| [`@git-diff-view/solid`](packages/solid) | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/solid)](https://www.npmjs.com/package/@git-diff-view/solid) |
| [`@git-diff-view/svelte`](packages/svelte)|[![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/svelte)](https://www.npmjs.com/package/@git-diff-view/svelte)|

### syntax highlighter

| Package                                                   | Version                                                                                                                          |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [`@git-diff-view/lowlight`](packages/lowlight) `build in` | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/lowlight)](https://www.npmjs.com/package/@git-diff-view/lowlight) |
| [`@git-diff-view/shiki`](packages/shiki)                  | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/shiki)](https://www.npmjs.com/package/@git-diff-view/shiki)       |

## Screen Shot

![Screenshot](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/1.png)
![Screenshot](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/69c801e5eb5fcabc9c9655825eb1228f18dc1e0c/5.png)
![Screenshot](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/theme.png)
![Screenshot](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/2.png)
![Screenshot](https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/aa2e918498270f737d28e7531eab08fa3f1b8831/3.png)

### Template mode

For better performance and customization, now the `DiffView` component support `template mode`, and it's the default setting. SEE [Template Mode](https://github.com/MrWangJustToDo/git-diff-view/blob/main/packages/core/src/parse/template.ts)

### FastDiff template

Using the `template mode`, the `DiffView` component can utilize the `fast-diff` package to generate diffLine templates for better readability of differences. SEE [FastDiffTemplate](https://github.com/MrWangJustToDo/git-diff-view/blob/main/packages/core/src/parse/template.ts)

#### Default diffLine
![Screenshot](https://github.com/MrWangJustToDo/git-diff-view/blob/main/default.png)

#### FastDiff diffLine
![Screenshot](https://github.com/MrWangJustToDo/git-diff-view/blob/main/enableFastDiffTemplate.png)

## Features

+ [x] Show the `git diff` result 
+ [x] Support `Split View` and `Unified View`
+ [x] Support `Warp` / `UnWarp` the code line
+ [x] Support `light` / `dark` theme by default (since v0.0.17)
+ [x] Support `Syntax Highlight` with <b>`full syntax context`</b> (base on `hast` AST)
+ [x] Support `Extend Data` component in the `Diff View`
+ [x] Support `Widget` component in the `Diff View`
+ [x] Support `Web Worker` / `Node Server` to improve performance
+ [x] Support `React` and `Vue` component
+ [x] Support compare by `@git-diff-view/core`(git diff) or `@git-diff-view/file`(file content)
+ [x] Support `Diff Match Patch` to improve line diff (experimental)
+ [x] Support `SSR` for `React` and `Vue` component (since v0.0.21)
+ [x] Support `RSC` for `React` component (since v0.0.21)
+ [ ] Support `Virtual Scroll` to improve performance


## Install

```shell
# In React Project
pnpm add @git-diff-view/react

# In Vue Project
pnpm add @git-diff-view/vue

```

## Use in React

#### There are two ways to use this component:

#### 1. Use the `DiffView` component directly.

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";
// if you have your own tailwindcss config, you can use the `diff-view-pure.css` to avoid CSS conflicts
import "@git-diff-view/react/styles/diff-view-pure.css";

<DiffView<string>
  // use data
  data={{
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  }}
  extendData={{oldFile: {10: {data: 'foo'}}, newFile: {20: {data: 'bar'}}}}
  renderExtendLine={({ data }) => ReactNode}
  diffViewFontSize={number}
  diffViewHighlight={boolean}
  diffViewMode={DiffModeEnum.Split | DiffModeEnum.Unified}
  diffViewWrap={boolean}
  diffViewTheme={'light' | 'dark'}
  diffViewAddWidget
  onAddWidgetClick={({ side, lineNumber }) => void}
  renderWidgetLine={({ onClose, side, lineNumber }) => ReactNode}
/>

```

#### 2. Use the `DiffView` component with `@git-diff-view/core` or `@git-diff-view/file`

```tsx
// with @git-diff-view/file
import { DiffFile, generateDiffFile } from "@git-diff-view/file";
const file = generateDiffFile(
  data?.oldFile?.fileName || "",
  data?.oldFile?.content || "",
  data?.newFile?.fileName || "",
  data?.newFile?.content || "",
  data?.oldFile?.fileLang || "",
  data?.newFile?.fileLang || ""
);
file.initTheme('light' / 'dark');
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

// with @git-diff-view/core
import { DiffFile } from "@git-diff-view/core";
const file = new DiffFile(
  data?.oldFile?.fileName || "",
  data?.oldFile?.content || "",
  data?.newFile?.fileName || "",
  data?.newFile?.content || "",
  data?.hunks || [],
  data?.oldFile?.fileLang || "",
  data?.newFile?.fileLang || ""
);
file.initTheme('light' / 'dark');
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

// use current data to render
<DiffView diffFile={file} {...props} />;
// or use the bundle data to render, eg: postMessage/httpRequest
const bundle = file.getBundle();
const diffFile = DiffFile.createInstance(data || {}, bundle);
<DiffView diffFile={diffFile} {...props} />;
```

#### Props

| Props  | Description  |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data             | The diff data need to show, type: `{ oldFile: {fileName?: string, content?: string}, newFile: {fileName?: string, content?: string}, hunks: string[] }`, you can only pass hunks data, and the component will generate the oldFile and newFile data automatically |
| diffFile         | the target data to render |
| renderWidgetLine | return a valid `react` element to show the widget, this element will render when you click the `addWidget` button in the diff view  |
| renderExtendLine | return a valid `react` element to show the extend data |
| extendData       | a list to store the extend data to show in the `Diff View`, type: {oldFile: {lineNumber: {data: any}}, newFile: {lineNumber: {data: any}}}   |
| diffViewFontSize | the fontSize for the DiffView component, type: number |
| diffViewHighlight | enable syntax highlight, type: boolean |
| diffViewMode     | the mode for the DiffView component, type: `DiffModeEnum.Split` / `DiffModeEnum.Unified` |
| diffViewWrap     | enable code line auto wrap, type: boolean |
| diffViewTheme    | the theme for the DiffView component, type: `light` / `dark` |
| diffViewAddWidget| enable `addWidget` button, type: boolean |
| onAddWidgetClick | when the `addWidget` button clicked, type: `({ side: "old" / "new", lineNumber: number }) => void` |

## Development

```bash
# clone this project

# pnpm install

# pnpm run build:packages

# pnpm run dev:react / pnpm run dev:vue

```
