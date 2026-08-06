import { DiffFileLineType, type DiffFile, type DiffUnifiedLineItem } from "@git-diff-view/core";
import { diffAsideWidthName } from "@git-diff-view/utils";
import { memo } from "@lynx-js/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";
import { estimateListItemHeight, estimateUnifiedLineNumberWidth, listItemKey } from "./styleUtils";
import { getVisibleUnifiedLines } from "./visibleLines";

const DiffUnifiedViewLine = ({ line, diffFile }: { line: DiffUnifiedLineItem; diffFile: DiffFile }) => {
  switch (line.type) {
    case DiffFileLineType.hunk:
      return <DiffUnifiedHunkLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.content:
      return <DiffUnifiedContentLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    case DiffFileLineType.extend:
      return <DiffUnifiedExtendLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />;
    default:
      return <view />;
  }
};

const InternalDiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();
  const fontSize = useDiffContext.useShallowStableSelector((s) => s.fontSize) || 13;

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);
  const width = estimateUnifiedLineNumberWidth(unifiedLineLength, fontSize);
  const lines = getVisibleUnifiedLines(diffFile);

  return (
    <list
      className="unified-diff-view w-full"
      list-type="single"
      scroll-orientation="vertical"
      style={{
        height: "100%",
        width: "100%",
        // @ts-expect-error CSS custom property
        [diffAsideWidthName]: `${width}px`,
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: `${fontSize}px`,
      }}
    >
      {lines.map((line) => {
        const key = listItemKey(line.type, line.index);
        return (
          <list-item
            key={key}
            item-key={key}
            estimated-main-axis-size-px={estimateListItemHeight(line.type, fontSize)}
          >
            <DiffUnifiedViewLine line={line} diffFile={diffFile} />
          </list-item>
        );
      })}
    </list>
  );
};

InternalDiffUnifiedView.displayName = "DiffUnifiedView";

export const DiffUnifiedView = memo(InternalDiffUnifiedView) as typeof InternalDiffUnifiedView;
