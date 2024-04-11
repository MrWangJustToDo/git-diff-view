## A Vue UI Component to render `git diff` data, support `Split View` and `Unified View`, just like `GitHub` and `GitLab`.

### Usage

#### There are two ways to use this component:

1. Use the `DiffView` component directly.

```tsx
import "@git-diff-view/vue/styles/diff-view.css";
import { DiffView, DiffModeEnum } from "@git-diff-view/vue";
<DiffView
  :data="{
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  }"
  :diff-view-font-size="number"
  :diff-view-mode="DiffModeEnum.Split | DiffModeEnum.Unified"
  :diff-view-highlight="boolean"
  :diff-view-add-widget="boolean"
  :diff-view-wrap="boolean"
  @on-add-widget-click="({ side, lineNumber }) => {void}"
  :extend-data="{oldFile: {10: {data: 'foo'}}, newFile: {20: {data: 'bar'}}}"
>

```

2. Use the `DiffView` component with `@git-diff-view/core`/`@git-diff-view/file`

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
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

// with @git-diff-view/core
import { DiffView } from "@git-diff-view/core";
const file = new DiffFile(
  data?.oldFile?.fileName || "",
  data?.oldFile?.content || "",
  data?.newFile?.fileName || "",
  data?.newFile?.content || "",
  data?.hunks || [],
  data?.oldFile?.fileLang || "",
  data?.newFile?.fileLang || ""
);
file.init();
file.buildSplitDiffLines();
file.buildUnifiedDiffLines();

// use current data to render
<DiffView :diffFile={file}  />;
// or use the bundle data to render, eg: postMessage/httpRequest
const bundle = file.getBundle();
const diffFile = DiffFile.createInstance(data || {}, bundle);
<DiffView :diffFile={diffFile} />;
```

### Props

| Props  | Description  |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data             | The diff data need to show, type: `{ oldFile: {fileName?: string, content?: string}, newFile: {fileName?: string, content?: string}, hunks: string[] }`, you can only pass hunks data, and the component will generate the oldFile and newFile data automatically |
| diffFile         | the target data to render |
| extendData       | a list to store the extend data to show in the `Diff View`, type: {oldFile: {lineNumber: {data: any}}, newFile: {lineNumber: {data: any}}}   |
| diffViewFontSize | the fontSize for the DiffView component, type: number |
| diffViewHighlight | enable syntax highlight, type: boolean |
| diffViewMode     | the mode for the DiffView component, type: `DiffModeEnum.Split` or `DiffModeEnum.Unified` |
| diffViewWrap     | enable code line auto wrap, type: boolean |
| diffViewAddWidget| enable `addWidget` button, type: boolean |

### Slots

| Slot | description |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| widget (scope: {onClose, side, lineNumber}) | return a valid `vue` element to show the widget, this element will render when you click the `addWidget` button in the diff view  |
| extend (scope: {data}) | return a valid `vue` element to show the extend data |

### Events

| Event | description |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onAddWidgetClick | when the `addWidget` button clicked, return the `side` and `lineNumber` |

### example repo

[vue-example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/vue-example)
