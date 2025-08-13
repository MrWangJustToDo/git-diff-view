import { DiffFile, highlighter as buildInHighlighter, setEnableFastDiffTemplate } from "@git-diff-view/core";
import { getDiffViewHighlighter } from "@git-diff-view/shiki";

import type { DiffViewProps } from "@git-diff-view/react";

export type MessageData = {
  id: number;
  data: DiffViewProps<any>["data"];
  highlight?: boolean;
  theme?: "light" | "dark";
  bundle?: ReturnType<DiffFile["getBundle"]>;
  error?: string;
};

setEnableFastDiffTemplate(true);

const post = (d: MessageData) => postMessage(d);

buildInHighlighter.setMaxLineToIgnoreSyntax(60000);

// highlighter.setIgnoreSyntaxHighlightList([/.vue$/])

onmessage = async (event: MessageEvent<MessageData>) => {
  const _data = event.data;

  const data = _data.data;

  try {
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

    const highlighter = await getDiffViewHighlighter();

    if (_data.highlight) {
      highlighter.setMaxLineToIgnoreSyntax(60000);

      file.initSyntax({ registerHighlighter: highlighter });
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
  } catch (error) {
    const res: MessageData = {
      id: _data.id,
      data: _data.data,
      error: error instanceof Error ? error.message : String(error),
    };
    post(res);
  }
};
