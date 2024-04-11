## shiki highlighter for @git-diff-view


### usage
```tsx
import { DiffFile } from "@git-diff-view/core";
import { highlighterReady } from "@git-diff-view/shiki";

const diffFile = new DiffFile(...params);

diffFile.initRaw();

highlighterReady().then((highlighter) => {
  diffFile.initSyntax({ registerHighlighter: highlighter });

  diffFile.buildSplitDiffLines();

  diffFile.buildUnifiedDiffLines();

  setBundle(diffFile.getBundle());
});
```
