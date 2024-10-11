import { DiffFileLineType } from "@git-diff-view/core";
import * as React from "react";

import { DiffSplitContentLine } from "./DiffSplitContentLineNormal";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";

import type { SplitSide } from "./DiffView";
import type { DiffFile, DiffSplitLineItem } from "@git-diff-view/core";

// TODO 可能存在的性能问题，暂时不用这个方案
export const DiffSplitViewLine = ({
  line,
  side,
  diffFile,
}: {
  line: DiffSplitLineItem;
  side: SplitSide;
  diffFile: DiffFile;
}) => {
  switch (line.type) {
    case DiffFileLineType.hunk:
      return <DiffSplitHunkLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.content:
      return <DiffSplitContentLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.widget:
      return <DiffSplitWidgetLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.extend:
      return <DiffSplitExtendLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    default:
      return null;
  }
};
