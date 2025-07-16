import { DiffFile, highlighter as buildInHighlighter } from "@git-diff-view/core";
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

buildInHighlighter.setMaxLineToIgnoreSyntax(60000);

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
      // check current lang has registered
      let hasRegister = true;
      if (hasRegister && file._oldFileLang) {
        try {
          hasRegister = highlighter.hasRegisteredCurrentLang(file._oldFileLang);
        } catch {
          hasRegister = false;
        }
      }
      if (hasRegister && file._newFileLang) {
        try {
          hasRegister = highlighter.hasRegisteredCurrentLang(file._newFileLang);
        } catch {
          hasRegister = false;
        }
      }
      file.initSyntax({ registerHighlighter: hasRegister ? highlighter : undefined });
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
