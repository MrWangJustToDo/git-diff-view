import {
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "./color";
import { DiffUnifiedAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";

import type { DiffFileExtends } from "../utils";
import type { DiffFile, SyntaxLine, DiffLine } from "@git-diff-view/core";

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
    <tr data-line={index} data-state="diff" data-mode="del" className="diff-line group" style={{ backgroundColor: `var(${delContentBGName})` }}>
      <td
        className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: isWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget index={index - 1} diffFile={diffFile as DiffFileExtends} />
        <div className="flex">
          <span data-line-num-old={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
          <span className="w-[10px] shrink-0" />
          <span className="inline-block w-[50%]" />
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent isWrap={isWrap} diffFile={diffFile} isHighlight={isHighlight} rawLine={rawLine} diffLine={diffLine} syntaxLine={syntaxLine} />
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
    <tr data-line={index} data-state="diff" data-mode="add" className="diff-line group" style={{ backgroundColor: `var(${addContentBGName})` }}>
      <td
        className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: isWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget index={index - 1} diffFile={diffFile as DiffFileExtends} />
        <div className="flex">
          <span className="inline-block w-[50%]" />
          <span className="shrink-0 w-[10px]" />
          <span data-line-num-new={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent isWrap={isWrap} diffFile={diffFile} isHighlight={isHighlight} rawLine={rawLine} diffLine={diffLine} syntaxLine={syntaxLine} />
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

  const syntaxLine = newLineNumber ? diffFile.getNewSyntaxLine(newLineNumber) : oldLinenumber ? diffFile.getOldSyntaxLine(oldLinenumber) : undefined;

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
          backgroundColor: hasDiff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`,
        }}
      >
        <td
          className="diff-line-num left-[0] pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
          style={{
            position: isWrap ? "relative" : "sticky",
            color: `var(${plainLineNumberColorName})`,
            backgroundColor: hasDiff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`,
          }}
        >
          {hasDiff && <DiffUnifiedAddWidget index={index} diffFile={diffFile as DiffFileExtends} />}
          <div className="flex opacity-[0.5]">
            <span data-line-num-old={unifiedLine.oldLineNumber} className="inline-block w-[50%]">
              {unifiedLine.oldLineNumber}
            </span>
            <span className="w-[10px] shrink-0" />
            <span data-line-num-new={unifiedLine.newLineNumber} className="inline-block w-[50%]">
              {unifiedLine.newLineNumber}
            </span>
          </div>
        </td>
        <td className="diff-line-content pr-[10px] align-top">
          <DiffContent isWrap={isWrap} diffFile={diffFile} isHighlight={isHighlight} rawLine={rawLine} diffLine={diffLine} syntaxLine={syntaxLine} />
        </td>
      </tr>
    );
  }
};
