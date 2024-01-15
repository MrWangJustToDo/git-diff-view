import { DiffFile, SyntaxLine } from "../diff";
import { DiffLine } from "../diff/diff-line";
import { DiffContent } from "./DiffContent";
import {
  addContentBGName,
  addLineNumberBGName,
  addWidgetBGName,
  addWidgetColorName,
  delContentBGName,
  delLineNumberBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "./color";

const DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  isWrap,
  isHighlight,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="del"
      className="diff-line group"
      style={{ backgroundColor: `var(${delContentBGName})` }}
    >
      <td
        className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: isWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
        }}
      >
        <div
          className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
          style={{
            width: "calc(var(--diff-font-size--) * 1.4)",
            height: "calc(var(--diff-font-size--) * 1.4)",
          }}
        >
          <div
            className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-[0] top-[0] flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
            style={{
              color: `var(${addWidgetColorName})`,
              zIndex: 1,
              backgroundColor: `var(${addWidgetBGName})`,
            }}
          >
            +
          </div>
        </div>
        <div className="flex">
          <span data-line-num-old={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
          <span className="w-[10px] shrink-0" />
          <span className="inline-block w-[50%]" />
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent
          isWrap={isWrap}
          diffFile={diffFile}
          isHighlight={isHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

const DiffUnifiedNewLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  isWrap,
  isHighlight,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="add"
      className="diff-line group"
      style={{ backgroundColor: `var(${addContentBGName})` }}
    >
      <td
        className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: isWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
        }}
      >
        <div
          className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
          style={{
            width: "calc(var(--diff-font-size--) * 1.4)",
            height: "calc(var(--diff-font-size--) * 1.4)",
          }}
        >
          <div
            className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-[0] top-[0] flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
            style={{
              color: `var(${addWidgetColorName})`,
              zIndex: 1,
              backgroundColor: `var(${addWidgetBGName})`,
            }}
          >
            +
          </div>
        </div>
        <div className="flex">
          <span className="inline-block w-[50%]" />
          <span className="shrink-0 w-[10px]" />
          <span data-line-num-new={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent
          isWrap={isWrap}
          diffFile={diffFile}
          isHighlight={isHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

export const DiffUnifiedLine = ({
  index,
  diffFile,
  lineNumber,
  isWrap,
  isHighlight,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return null;

  const hasDiff = unifiedLine.diff;

  const hasChange = unifiedLine.diff?.isIncludeableLine();

  const rawLine = unifiedLine.value || "";

  const diffLine = unifiedLine.diff;

  const newLineNumber = unifiedLine.newLineNumber;

  const oldLinenumber = unifiedLine.oldLineNumber;

  const syntaxLine = newLineNumber
    ? diffFile.getNewSyntaxLine(newLineNumber)
    : oldLinenumber
    ? diffFile.getOldSyntaxLine(oldLinenumber)
    : undefined;

  if (hasChange) {
    if (unifiedLine.oldLineNumber) {
      return (
        <DiffUnifiedOldLine
          index={lineNumber}
          isWrap={isWrap}
          diffFile={diffFile}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
          isHighlight={isHighlight}
          lineNumber={unifiedLine.oldLineNumber}
        />
      );
    } else {
      return (
        <DiffUnifiedNewLine
          index={lineNumber}
          isWrap={isWrap}
          rawLine={rawLine}
          diffLine={diffLine}
          diffFile={diffFile}
          syntaxLine={syntaxLine}
          isHighlight={isHighlight}
          lineNumber={unifiedLine.newLineNumber!}
        />
      );
    }
  } else {
    return (
      <tr
        data-line={lineNumber}
        data-state={unifiedLine.diff ? "diff" : "plain"}
        className="diff-line group"
        style={{
          backgroundColor: hasDiff
            ? `var(${plainContentBGName})`
            : `var(${expandContentBGName})`,
        }}
      >
        <td
          className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
          style={{
            position: isWrap ? "relative" : "sticky",
            color: `var(${plainLineNumberColorName})`,
            backgroundColor: hasDiff
              ? `var(${plainLineNumberBGName})`
              : `var(${expandContentBGName})`,
          }}
        >
          {hasDiff && (
            <div
              className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
              style={{
                width: "calc(var(--diff-font-size--) * 1.4)",
                height: "calc(var(--diff-font-size--) * 1.4)",
              }}
            >
              <div
                className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-[0] top-[0] flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
                style={{
                  color: `var(${addWidgetColorName})`,
                  zIndex: 1,
                  backgroundColor: `var(${addWidgetBGName})`,
                }}
              >
                +
              </div>
            </div>
          )}
          <div className="flex opacity-[0.5]">
            <span
              data-line-num-old={unifiedLine.oldLineNumber}
              className="inline-block w-[50%]"
            >
              {unifiedLine.oldLineNumber}
            </span>
            <span className="w-[10px] shrink-0" />
            <span
              data-line-num-new={unifiedLine.newLineNumber}
              className="inline-block w-[50%]"
            >
              {unifiedLine.newLineNumber}
            </span>
          </div>
        </td>
        <td className="diff-line-content pr-[10px] align-top">
          <DiffContent
            isWrap={isWrap}
            diffFile={diffFile}
            isHighlight={isHighlight}
            rawLine={rawLine}
            diffLine={diffLine}
            syntaxLine={syntaxLine}
          />
        </td>
      </tr>
    );
  }
};
