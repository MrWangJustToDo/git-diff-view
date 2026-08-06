import { DiffFileLineType, type DiffFile, type DiffSplitLineItem } from "@git-diff-view/core";

import { DiffSplitContentLine } from "./DiffSplitContentLine";
import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitHunkLine } from "./DiffSplitHunkLine";

/** Never return null — ReactLynx list/slot updates break on null children. */
export const DiffSplitViewLine = ({ line, diffFile }: { line: DiffSplitLineItem; diffFile: DiffFile }) => {
  switch (line.type) {
    case DiffFileLineType.hunk:
      return <DiffSplitHunkLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.content:
      return <DiffSplitContentLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.extend:
      return <DiffSplitExtendLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    default:
      return <view />;
  }
};
