import { getSplitLines, DiffFileLineType } from "@git-diff-view/core";
import * as React from "react";
import { memo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { useDiffViewContext } from "..";
import { useCallbackRef } from "../hooks/useCallbackRef";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";
import { SplitSide } from "./DiffView";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile, DiffSplitLineItem } from "@git-diff-view/core";

const getState = (line: DiffSplitLineItem) => {
  const type = line.type;
  switch (type) {
    case DiffFileLineType.hunk:
      return "hunk";
    case DiffFileLineType.lastHunk:
      return "last-hunk";
    case DiffFileLineType.extend:
      return "extend";
    case DiffFileLineType.widget:
      return "widget";
    case DiffFileLineType.content:
      return line.splitLine?.left?.diff || line.splitLine?.right?.diff ? "diff" : "plain";
  }
};

const getLineNum = (line: DiffSplitLineItem) => {
  const lineNum = line.lineNumber;
  const type = line.type;
  return `${lineNum}${type === DiffFileLineType.hunk || type === DiffFileLineType.lastHunk ? "-hunk" : type === DiffFileLineType.widget ? "-widget" : type === DiffFileLineType.extend ? "-extend" : ""}`;
};

const getClassName = (line: DiffSplitLineItem) => {
  const type = line.type;
  if (type === DiffFileLineType.content) return "diff-line";
  if (type === DiffFileLineType.hunk) return "diff-line diff-line-hunk";
  if (type === DiffFileLineType.lastHunk) return "diff-line diff-line-hunk";
  if (type === DiffFileLineType.extend) return "diff-line diff-line-extend";
  if (type === DiffFileLineType.widget) return "diff-line diff-line-widget";
};

export const DiffSplitViewWrap = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const splitLineLength = diffFile.splitLineLength;

  const { useDiffContext } = useDiffViewContext();

  const { useWidget } = useDiffWidgetContext();

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  const fontSize = useDiffContext(React.useCallback((s) => s.fontSize, []));

  const { extendData, renderWidgetLine, renderExtendLine } = useDiffContext(
    React.useCallback(
      (s) => ({ extendData: s.extendData, renderExtendLine: s.renderExtendLine, renderWidgetLine: s.renderWidgetLine }),
      []
    )
  );

  const { widgetSide, widgetLineNumber } = useWidget(
    React.useCallback((s) => ({ widgetSide: s.widgetSide, widgetLineNumber: s.widgetLineNumber }), [])
  );

  const getLines = useCallbackRef(() =>
    getSplitLines(diffFile, {
      hasRenderExtend: typeof renderExtendLine === "function",
      hasRenderWidget: typeof renderWidgetLine === "function",
      extendData: Array.from(
        new Set(Object.keys(extendData?.oldFile ?? {}).concat(Object.keys(extendData?.newFile ?? {})))
      ).reduce(
        (prev, c) => ({
          ...prev,
          [c]: {
            data: extendData?.newFile?.[c]?.data || extendData?.oldFile?.[c]?.data,
            side: extendData?.newFile?.[c] ? "right" : "left",
          },
        }),
        {}
      ),
      widgetData: { [widgetLineNumber]: { side: widgetSide === SplitSide.old ? "left" : "right" } },
    })
  );

  const width = useTextWidth({
    text: splitLineLength.toString(),
    font: { fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" },
  });

  const [lines, setLines] = React.useState(getLines);

  React.useEffect(() => {
    setLines(getLines());

    const unsubscribe = diffFile.subscribe(() => {
      setLines(getLines());
    });

    return unsubscribe;
  }, [diffFile, extendData, renderExtendLine, renderWidgetLine, widgetSide, widgetLineNumber, getLines]);

  const _width = Math.round(width) + 25;

  return (
    <div className="split-diff-view split-diff-view-normal w-full">
      <div
        className="diff-table-wrapper virtualizer-container relative w-full"
        style={{
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        {width > 0 && (
          <table className="diff-table border-collapse table-fixed w-full">
            <colgroup>
              <col className="diff-table-old-num-col" width={_width} />
              <col className="diff-table-old-content-col" />
              <col className="diff-table-new-num-col" width={_width} />
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
            <tbody className="diff-table-body leading-[1.4] relative">
              {lines.map((line) => {
                const type = line.type;
                const _index = line.index;
                const lineNumber = getLineNum(line);
                const state = getState(line);
                const className = getClassName(line);
                return (
                  <tr
                    key={lineNumber}
                    data-state={state}
                    data-line={lineNumber}
                    className={className}
                    style={{ contentVisibility: "auto" }}
                  >
                    {type === DiffFileLineType.hunk && <DiffSplitHunkLine index={_index} diffFile={diffFile} />}
                    {type === DiffFileLineType.content && <DiffSplitLine index={_index} diffFile={diffFile} />}
                    {type === DiffFileLineType.widget && <DiffSplitWidgetLine index={_index} diffFile={diffFile} />}
                    {type === DiffFileLineType.extend && <DiffSplitExtendLine index={_index} diffFile={diffFile} />}
                    {type === DiffFileLineType.lastHunk && <DiffSplitLastHunkLine diffFile={diffFile} />}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

DiffSplitViewWrap.displayName = "DiffSplitViewWrap";
