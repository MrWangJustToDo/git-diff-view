import { DiffFile } from "@git-diff-view/react";
import { highlighterReady } from "@git-diff-view/shiki";

import type { DiffViewProps } from "@git-diff-view/react";

export type MessageData = {
  id: number;
  data: DiffViewProps<any>["data"];
  highlight?: boolean;
  theme?: "light" | "dark";
  bundle: ReturnType<DiffFile["getBundle"]>;
};

const post = (d: MessageData) => postMessage(d);

// highlighter.setMaxLineToIgnoreSyntax(60000);

// highlighter.setIgnoreSyntaxHighlightList([/.vue$/])

onmessage = (event: MessageEvent<MessageData>) => {
  const _data = event.data;

  const data = _data.data;

  const file = new DiffFile(
    data?.oldFile?.fileName || "",
    data?.oldFile?.content || "",
    data?.newFile?.fileName || "",
    data?.newFile?.content || "",
    data?.hunks || [],
    data?.oldFile?.fileLang || "",
    data?.newFile?.fileLang || ""
  );

  file.initTheme(_data.theme);

  file.initRaw();

  highlighterReady.then((highlighter) => {
    if (_data.highlight) {
      file.initSyntax({ registerHighlighter: highlighter });
      // file.initSyntax();
    }

    file.buildSplitDiffLines();

    file.buildUnifiedDiffLines();

    const res: MessageData = {
      id: _data.id,
      data: _data.data,
      bundle: file._getFullBundle(),
    };

    file.clear();

    post(res);
  });
};
