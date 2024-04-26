import { DiffFileLineType } from "@git-diff-view/core";
import * as React from "react";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitLine } from "./DiffSplitLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";

import type { SplitSide } from "..";
import type { DiffFile, DiffSplitLineItem } from "@git-diff-view/core";

// TODO
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
      return <DiffSplitLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.widget:
      return <DiffSplitWidgetLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.extend:
      return <DiffSplitExtendLine side={side} index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    default:
      return <React.Fragment />;
  }
};
