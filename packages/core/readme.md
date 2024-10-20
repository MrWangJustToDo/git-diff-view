## `git diff` for @git-diff-view Component

## Usage

```tsx
// ==== step1: generate diff view data, this part can be used in the worker/server environment for better performance ==== //
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
// light / dark theme, base on current highlight engine
file.initTheme(xxx);
// init
file.init();
// or you can use below method to init
file.initRaw();
file.initSyntax(); // if you do not want syntax highlight, you can skip this step

// build the `Split View` data;
file.buildSplitDiffLines();

// build the `Unified View` data;
file.buildUnifiedDiffLines();

// get All the diff data bundle, you can safely to send this data to the client side
const bundle = file.getBundle();

// ==== step2: render the @git-diff-view component ==== //

// merge bundle
const mergeFile = DiffFile.createInstance(data || {}, bundle);

// used for @git-diff-view/react and @git-diff-view/vue
<DiffView diffFile={mergeFile} />

<DiffView :diffFile="mergeFile" />

```
