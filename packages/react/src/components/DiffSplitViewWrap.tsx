import { numIterator, type DiffFile } from "@git-diff-view/core";
import * as React from "react";
import { Fragment, memo } from "react";

import { useDiffViewContext } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

export const DiffSplitViewWrap = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const splitLineLength = diffFile.splitLineLength;

  const { useDiffContext } = useDiffViewContext();

  const fontSize = useDiffContext(React.useCallback((s) => s.fontSize, []));

  const width = useTextWidth({
    text: splitLineLength.toString(),
    font: { fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" },
  });

  return (
    <div className="split-diff-view split-diff-view-normal w-full">
      <div
        className="diff-table-wrapper w-full"
        style={{
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        <table className="diff-table border-collapse table-fixed w-full">
          <colgroup>
            <col className="diff-table-old-num-col" width={Math.round(width) + 25} />
            <col className="diff-table-old-content-col" />
            <col className="diff-table-new-num-col" width={Math.round(width) + 25} />
            <col className="diff-table-new-content-col" />
          </colgroup>
          <thead className="hidden">
            <tr>
              <th scope="col">old line number</th>
              <th scope="col">old line content</th>
              <th scope="col">new line number</th>
              <th scope="col">new line content</th>
            </tr>
          </thead>
          <tbody className="diff-table-body leading-[1.4]">
            {numIterator(splitLineLength, (index) => (
              <Fragment key={index}>
                <DiffSplitHunkLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                <DiffSplitLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                <DiffSplitWidgetLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                <DiffSplitExtendLine index={index} lineNumber={index + 1} diffFile={diffFile} />
              </Fragment>
            ))}
            <DiffSplitLastHunkLine diffFile={diffFile} />
          </tbody>
        </table>
      </div>
    </div>
  );
});

DiffSplitViewWrap.displayName = "DiffSplitViewWrap";
