## A Cli DiffView Component like GitHub, Easy to use and feature complete. 

### Usage

#### There are two ways to use this component:

1. Use the `DiffView` component directly.

```tsx
import { DiffView, DiffModeEnum } from "@git-diff-view/cli";

<DiffView<string>
  // use data
  data={{
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  }}
  width={number}
  extendData={{oldFile: {10: {data: 'foo'}}, newFile: {20: {data: 'bar'}}}}
  renderExtendLine={({ data }) => ReactNode}
  diffViewHighlight={boolean}
  diffViewTabSpace={boolean}
  diffViewTabWidth={"small" | "medium" | "large"}
  diffViewMode={DiffModeEnum.Split | DiffModeEnum.Unified}
  diffViewTheme={'light' | 'dark'}
/>

```

2. Use the `DiffView` component with `@git-diff-view/core` or `@git-diff-view/file`

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