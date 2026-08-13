import { DiffLineType } from "@git-diff-view/core";
import { memo } from "@lynx-js/react";

import { useDiffViewContext } from "./DiffViewContext";
import { estimateLineHeight, getStyleFromClassName, getStyleObjectFromString, asDiffStyle } from "./styleUtils";
import { joinClass } from "../theme";

import type { DiffFile, DiffLine, File } from "@git-diff-view/core";
import type { DiffViewStyle } from "./styleUtils";

/** Corner radius mode for inline char highlights (mirrors core template 0.2em logic). */
type HighlightEdge = "full" | "start" | "end" | "mid";

type TextRun = {
  key: string;
  text: string;
  color?: string;
  highlightClass?: string;
  highlightEdge?: HighlightEdge;
};

const preserveSpaces = (s: string) =>
  s.replace(/\t/g, "  ").replace(/ /g, "\u00A0").replace(/\n/g, "").replace(/\r/g, "");

const operatorGutterWidth = (fontSize: number) => Math.round(fontSize * 1.5);

const radiusStyle = (edge?: HighlightEdge): DiffViewStyle => {
  if (!edge) return {};
  const r = "0.2em";
  if (edge === "full") return { borderRadius: r };
  if (edge === "start") return { borderTopLeftRadius: r, borderBottomLeftRadius: r };
  if (edge === "end") return { borderTopRightRadius: r, borderBottomRightRadius: r };
  return {};
};

const buildPlainRuns = (rawLine: string, highlightClass: string | undefined, diffLine?: DiffLine): TextRun[] => {
  const changes = diffLine?.changes;
  if (!changes?.hasLineChange || !highlightClass) {
    return [{ key: "0", text: preserveSpaces(rawLine || " ") }];
  }
  const range = changes.range;
  const runs: TextRun[] = [];
  const before = rawLine.slice(0, range.location);
  const mid = rawLine.slice(range.location, range.location + range.length);
  const after = rawLine.slice(range.location + range.length);
  if (before) runs.push({ key: "b", text: preserveSpaces(before) });
  if (mid) runs.push({ key: "m", text: preserveSpaces(mid), highlightClass, highlightEdge: "full" });
  if (after) runs.push({ key: "a", text: preserveSpaces(after) });
  return runs.length ? runs : [{ key: "0", text: "\u00A0" }];
};

const buildSyntaxRuns = (
  rawLine: string,
  syntaxLine: File["syntaxFile"][number],
  theme: "light" | "dark",
  highlightClass: string | undefined,
  diffLine?: DiffLine
): TextRun[] => {
  const nodes = syntaxLine.nodeList || [];
  if (!nodes.length) return buildPlainRuns(rawLine, highlightClass, diffLine);

  const changes = diffLine?.changes;
  const range = changes?.hasLineChange ? changes.range : null;
  const runs: TextRun[] = [];

  nodes.forEach(({ node, wrapper }, index) => {
    const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
    const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
    const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
    const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
    const color = (shikiStyle as { color?: string })?.color || (lowlightStyle as { color?: string })?.color;
    const value = node.value || "";
    if (!value) return;

    if (!range || node.endIndex < range.location || range.location + range.length < node.startIndex) {
      runs.push({ key: String(index), text: preserveSpaces(value), color });
      return;
    }

    const start = node.startIndex;
    const end = node.endIndex;
    const rangeStart = range.location;
    const rangeEnd = range.location + range.length;
    let cursor = start;
    let offset = 0;
    let part = 0;

    const pushSlice = (to: number, highlight: boolean) => {
      if (to <= cursor) return;
      const len = to - cursor;
      const text = value.slice(offset, offset + len);
      const sliceStart = cursor;
      offset += len;
      cursor = to;
      if (!text) return;

      let highlightEdge: HighlightEdge | undefined;
      if (highlight) {
        const isStart = sliceStart <= rangeStart && to > rangeStart;
        const isEnd = sliceStart < rangeEnd && to >= rangeEnd;
        if (isStart && isEnd) highlightEdge = "full";
        else if (isStart) highlightEdge = "start";
        else if (isEnd) highlightEdge = "end";
        else highlightEdge = "mid";
      }

      runs.push({
        key: `${index}-${part++}`,
        text: preserveSpaces(text),
        color,
        highlightClass: highlight ? highlightClass : undefined,
        highlightEdge,
      });
    };

    if (rangeStart > cursor) pushSlice(Math.min(rangeStart, end + 1), false);
    if (rangeEnd > cursor) pushSlice(Math.min(rangeEnd, end + 1), true);
    if (end + 1 > cursor) pushSlice(end + 1, false);
  });

  return runs.length ? runs : [{ key: "0", text: preserveSpaces(rawLine || " ") }];
};

type DiffContentProps = {
  rawLine: string;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
};

const InternalDiffContent = ({ diffLine, rawLine, syntaxLine, enableHighlight, enableWrap }: DiffContentProps) => {
  const { useDiffContext } = useDiffViewContext();
  const { theme, fontSize } = useDiffContext.useShallowStableSelector((s) => ({
    theme: (s.theme || "light") as "light" | "dark",
    fontSize: s.fontSize || 13,
  }));

  const isAdded = diffLine?.type === DiffLineType.Add;
  const isDelete = diffLine?.type === DiffLineType.Delete;
  const highlightClass = isAdded ? "diff-inline-hl-add" : isDelete ? "diff-inline-hl-del" : undefined;
  const isMaxLineLengthToIgnoreSyntax = !!(syntaxLine && syntaxLine.nodeList && syntaxLine.nodeList.length > 150);

  const useRuns = enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax;
  const runs = useRuns
    ? buildSyntaxRuns(rawLine, syntaxLine!, theme, highlightClass, diffLine)
    : buildPlainRuns(rawLine, highlightClass, diffLine);

  const operatorChar = isAdded ? "+" : isDelete ? "-" : "\u00A0";
  const gutterW = operatorGutterWidth(fontSize);
  const lineHeight = estimateLineHeight(fontSize);
  // Match react DiffContent: break mid-token on wrap (code often has no spaces).
  const wrapStyle = enableWrap
    ? ({ whiteSpace: "pre-wrap", wordBreak: "break-all" } as const)
    : ({ whiteSpace: "nowrap", wordBreak: "normal" } as const);

  return (
    <view
      className={
        enableWrap
          ? "diff-line-content-item flex w-full flex-row items-start"
          : "diff-line-content-item flex flex-row items-start"
      }
      flatten={false}
      style={enableWrap ? undefined : { minHeight: `${lineHeight}px` }}
    >
      <view
        className="diff-line-content-operator flex flex-shrink-0 justify-center"
        style={{ width: `${gutterW}px`, minWidth: `${gutterW}px`, maxWidth: `${gutterW}px` }}
      >
        <text
          className="diff-fg-content text-center"
          style={asDiffStyle({ ...wrapStyle, lineHeight: `${lineHeight}px` })}
        >
          {operatorChar}
        </text>
      </view>
      <text
        className={
          enableWrap
            ? "diff-line-content-text diff-fg-content w-full min-w-0 flex-1"
            : "diff-line-content-text diff-fg-content flex-shrink-0"
        }
        style={asDiffStyle({
          ...wrapStyle,
          lineHeight: `${lineHeight}px`,
          ...(enableWrap ? { flexBasis: "0%" } : {}),
        })}
      >
        {runs.map((run) => (
          <text
            key={run.key}
            className={joinClass(!run.color && "diff-fg-content", run.highlightClass)}
            style={asDiffStyle({
              ...wrapStyle,
              lineHeight: `${lineHeight}px`,
              ...(run.color ? { color: run.color } : {}),
              ...radiusStyle(run.highlightEdge),
            })}
          >
            {run.text}
          </text>
        ))}
      </text>
    </view>
  );
};

InternalDiffContent.displayName = "DiffContent";

export const DiffContent = memo(InternalDiffContent) as typeof InternalDiffContent;
