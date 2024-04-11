## File content diff for @git-diff-view component

## Usage

```tsx
const file = new DiffFile(
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

// get All the bundle
const bundle = file.getBundle();

// merge bundle
const mergeFile = DiffFile.createInstance(data || {}, bundle);

// used for @git-diff-view/react and @git-diff-view/vue
<DiffView diffFile={mergeFile} />

<DiffView :diffFile="mergeFile" />

```
