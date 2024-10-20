## Git Diff Component

a React/Vue component to show the `git diff`/`file diff` result, just like Github code review page.

[![Deploy](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/git-diff-view/actions/workflows/deploy.yml)

## Demo ---- git-diff / file-diff
[git-mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=git)

![git mode](gitMode.png)

[file-mode](https://mrwangjusttodo.github.io/git-diff-view/?type=try&tab=file)

![file mode](fileMode.png)

[GitHub compare](https://mrwangjusttodo.github.io/MrWangJustToDo.io?overlay=open&playGround=GitHub)

![GitHub compare](4.png)

## Packages

| Package                                  | Version                                                                                                                    |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [`@git-diff-view/core`](packages/core)   | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/core)](https://www.npmjs.com/package/@git-diff-view/core)   |
| [`@git-diff-view/file`](packages/file)   | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/file)](https://www.npmjs.com/package/@git-diff-view/file)   |
| [`@git-diff-view/react`](packages/react) | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/react)](https://www.npmjs.com/package/@git-diff-view/react) |
| [`@git-diff-view/vue`](packages/vue)     | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/vue)](https://www.npmjs.com/package/@git-diff-view/vue)     |

### syntax highlighter

| Package                                                   | Version                                                                                                                          |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [`@git-diff-view/lowlight`](packages/lowlight) `build in` | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/lowlight)](https://www.npmjs.com/package/@git-diff-view/lowlight) |
| [`@git-diff-view/shiki`](packages/shiki)                  | [![npm (scoped)](https://img.shields.io/npm/v/%40git-diff-view/shiki)](https://www.npmjs.com/package/@git-diff-view/shiki)       |

## Screen Shot

![Screenshot](1.png)
![Screenshot](theme.png)
![Screenshot](2.png)
![Screenshot](3.png)


## Features

+ [x] Show the `git diff` result 
+ [x] Support `Split View` and `Unified View`
+ [x] Support `Warp` / `UnWarp` the code line
+ [x] Support `light` / `dark` theme by default
+ [x] Support `Syntax Highlight` with <b>`full syntax context`</b> (base on `hast` AST)
+ [x] Support `Extend Data` component in the `Diff View`
+ [x] Support `Widget` component in the `Diff View`
+ [x] Support `Web Worker` / `Node Server` to improve performance
+ [x] Support `React` and `Vue` component
+ [x] Support compare by `@git-diff-view/core`(git diff) or `@git-diff-view/file`(file content)
+ [x] Support `Diff Match Patch` to improve line diff
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
| diffViewMode     | the mode for the DiffView component, type: `DiffModeEnum.Split` or `DiffModeEnum.Unified` |
| diffViewWrap     | enable code line auto wrap, type: boolean |
| diffViewTheme    | the theme for the DiffView component, type: `light` or `dark` |
| diffViewAddWidget| enable `addWidget` button, type: boolean |
| onAddWidgetClick | when the `addWidget` button clicked, type: `({ side: "old" | "new", lineNumber: number }) => void` |

## Use in Vue

Same with the React, see [detail](https://github.com/MrWangJustToDo/git-diff-view/tree/main/packages/vue)

## Development

```bash
# clone this project

# pnpm install

# pnpm run build:packages

# pnpm run dev:react / pnpm run dev:vue

```
