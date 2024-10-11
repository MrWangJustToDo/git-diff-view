import { DiffFileLineType } from "@git-diff-view/core";
import * as React from "react";

import { DiffSplitContentLine } from "./DiffSplitContentLineWrap";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

import type { DiffFile, DiffSplitLineItem } from "@git-diff-view/core";

// TODO 可能存在的性能问题，暂时不用这个方案
export const DiffSplitViewLine = ({ line, diffFile }: { line: DiffSplitLineItem; diffFile: DiffFile }) => {
  switch (line.type) {
    case DiffFileLineType.hunk:
      return <DiffSplitHunkLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.content:
      return <DiffSplitContentLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.widget:
      return <DiffSplitWidgetLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.extend:
      return <DiffSplitExtendLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    default:
      return null;
  }
};
