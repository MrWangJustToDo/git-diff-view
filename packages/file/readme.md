## file content diff for @git-diff-view component

This package is a wrapper for [`diff`](https://github.com/kpdecker/jsdiff) and [`@git-diff-view/core`](https://github.com/MrWangJustToDo/git-diff-view) to support pure file content diff.

## Usage

```tsx
// ==== step1: generate diff view data, same as the `@git-diff-view/core` ==== //
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

// get All the bundle
const bundle = file.getBundle();

// ==== step2: render the @git-diff-view component ==== //

// merge bundle
const mergeFile = DiffFile.createInstance(data || {}, bundle);

// used for @git-diff-view/react and @git-diff-view/vue
<DiffView diffFile={mergeFile} />

<DiffView :diffFile="mergeFile" />

```
