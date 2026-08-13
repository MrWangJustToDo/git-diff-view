import { type DiffFile } from "@git-diff-view/core";
import { diffAsideWidthName } from "@git-diff-view/utils";
import { memo } from "@lynx-js/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { DiffSplitViewLine } from "./DiffSplitViewLine";
import { useDiffViewContext } from "./DiffViewContext";
import { estimateLineNumberWidth, estimateListItemHeight, listItemKey } from "./styleUtils";
import { getVisibleSplitLines } from "./visibleLines";

const InternalDiffSplitView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();
  const fontSize = useDiffContext.useShallowStableSelector((s) => s.fontSize) || 13;

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);
  const width = estimateLineNumberWidth(splitLineLength, fontSize);
  const lines = getVisibleSplitLines(diffFile);

  return (
    <list
      className="split-diff-view split-diff-view-wrap w-full"
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
            <DiffSplitViewLine line={line} diffFile={diffFile} />
          </list-item>
        );
      })}
    </list>
  );
};

InternalDiffSplitView.displayName = "DiffSplitView";

export const DiffSplitView = memo(InternalDiffSplitView) as typeof InternalDiffSplitView;
