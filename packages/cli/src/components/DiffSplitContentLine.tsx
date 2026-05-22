import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import { NewLineSymbol } from "@git-diff-view/utils";
import { Box } from "ink";

import {
  diffAddLineNumber,
  diffDelLineNumber,
  diffEmptyContent,
  diffExpandLineNumber,
  diffExpandLineNumberColor,
  diffPlainLineNumber,
  diffPlainLineNumberColor,
  noBGDiffAddLineNumber,
  noBGDiffDelLineNumber,
} from "./color";
import { DiffContent } from "./DiffContent";
import { DiffSplitLineNumberArea, DiffEmptyArea } from "./DiffLineNumber";
import { getCurrentLineRow } from "./tools";

const InternalDiffSplitLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  enableHighlight,
  noBG,
}: {
  index: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  enableHighlight: boolean;
  noBG?: boolean;
}) => {
  const oldLine = diffFile.getSplitLeftLine(index);
  const newLine = diffFile.getSplitRightLine(index);

  const oldSyntaxLine = diffFile.getOldSyntaxLine(oldLine?.lineNumber ?? -1);
  const oldPlainLine = diffFile.getOldPlainLine(oldLine.lineNumber ?? -1);
  const newSyntaxLine = diffFile.getNewSyntaxLine(newLine?.lineNumber ?? -1);
  const newPlainLine = diffFile.getNewPlainLine(newLine.lineNumber ?? -1);

  const hasDiff = !!oldLine?.diff || !!newLine?.diff;
  const hasChange = checkDiffLineIncludeChange(oldLine?.diff) || checkDiffLineIncludeChange(newLine?.diff);

  const oldLineIsDelete = oldLine?.diff?.type === DiffLineType.Delete;
  const newLineIsAdded = newLine?.diff?.type === DiffLineType.Add;

  const hasOldLine = !!oldLine.lineNumber;
  const hasNewLine = !!newLine.lineNumber;

  const emptyBG = noBG ? undefined : theme === "light" ? diffEmptyContent.light : diffEmptyContent.dark;
  const halfColumns = columns / 2;
  const contentWidth = columns / 2 - lineNumWidth - 2;

  // Calculate row heights - must match the actual wrap width used in DiffContent
  // DiffContent receives contentWidth and wraps at (contentWidth - 2) for the operator column and end padding
  const noNewlineText = "\\ No newline at end of file";

  // Include "No newline" text in row calculation if present
  const oldContent =
    oldLine?.diff?.changes?.hasLineChange && oldLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? (oldLine?.value || "") + noNewlineText
      : oldLine?.value || "";

  const newContent =
    newLine?.diff?.changes?.hasLineChange && newLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? (newLine?.value || "") + noNewlineText
      : newLine?.value || "";

  const oldRow = getCurrentLineRow({ content: oldContent, width: contentWidth - 2 });
  const newRow = getCurrentLineRow({ content: newContent, width: contentWidth - 2 });

  const row = Math.max(oldRow, newRow);

  const delLnColors = noBG ? noBGDiffDelLineNumber : diffDelLineNumber;
  const addLnColors = noBG ? noBGDiffAddLineNumber : diffAddLineNumber;

  const oldLineNumberBG = oldLineIsDelete
    ? theme === "light"
      ? delLnColors.light
      : delLnColors.dark
    : noBG
      ? undefined
      : hasDiff
        ? theme === "light"
          ? diffPlainLineNumber.light
          : diffPlainLineNumber.dark
        : theme === "light"
          ? diffExpandLineNumber.light
          : diffExpandLineNumber.dark;

  const newLineNumberBG = newLineIsAdded
    ? theme === "light"
      ? addLnColors.light
      : addLnColors.dark
    : noBG
      ? undefined
      : hasDiff
        ? theme === "light"
          ? diffPlainLineNumber.light
          : diffPlainLineNumber.dark
        : theme === "light"
          ? diffExpandLineNumber.light
          : diffExpandLineNumber.dark;

  const color = hasDiff
    ? theme === "light"
      ? diffPlainLineNumberColor.light
      : diffPlainLineNumberColor.dark
    : theme === "light"
      ? diffExpandLineNumberColor.light
      : diffExpandLineNumberColor.dark;

  return (
    <Box data-line={lineNumber} data-state={hasDiff ? "diff" : "plain"} height={row} width={columns}>
      {/* Left side (old line) */}
      {hasOldLine ? (
        <>
          <DiffSplitLineNumberArea
            lineNumber={oldLine.lineNumber}
            lineNumWidth={lineNumWidth}
            height={row}
            backgroundColor={oldLineNumberBG}
            color={color}
            dim={!hasChange}
          />
          <DiffContent
            theme={theme}
            height={row}
            diffFile={diffFile}
            width={contentWidth}
            rawLine={oldLine.value || ""}
            diffLine={oldLine.diff}
            plainLine={oldPlainLine}
            syntaxLine={oldSyntaxLine}
            enableHighlight={enableHighlight}
            noBG={noBG}
          />
        </>
      ) : (
        <DiffEmptyArea width={halfColumns} height={row} backgroundColor={emptyBG} />
      )}

      {/* Right side (new line) */}
      {hasNewLine ? (
        <>
          <DiffSplitLineNumberArea
            lineNumber={newLine.lineNumber}
            lineNumWidth={lineNumWidth}
            height={row}
            backgroundColor={newLineNumberBG}
            color={color}
            dim={!hasChange}
          />
          <DiffContent
            theme={theme}
            height={row}
            width={contentWidth}
            diffFile={diffFile}
            rawLine={newLine.value || ""}
            diffLine={newLine.diff}
            plainLine={newPlainLine}
            syntaxLine={newSyntaxLine}
            enableHighlight={enableHighlight}
            noBG={noBG}
          />
        </>
      ) : (
        <DiffEmptyArea width={halfColumns} height={row} backgroundColor={emptyBG} />
      )}
    </Box>
  );
};

export const DiffSplitContentLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  enableHighlight,
  noBG,
}: {
  index: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  enableHighlight: boolean;
  noBG?: boolean;
}) => {
  const oldLine = diffFile.getSplitLeftLine(index);
  const newLine = diffFile.getSplitRightLine(index);

  if (oldLine?.isHidden && newLine?.isHidden) return null;

  return (
    <InternalDiffSplitLine
      index={index}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      lineNumWidth={lineNumWidth}
      enableHighlight={enableHighlight}
      noBG={noBG}
    />
  );
};
