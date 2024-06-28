import { DiffLineType, NewLineSymbol, type DiffFile, type DiffLine, type SyntaxLine } from "@git-diff-view/core";
import * as React from "react";

import { addContentHighlightBGName, delContentHighlightBGName } from "./color";
import { DiffNoNewLine } from "./DiffNoNewLine";
import { diffFontSizeName } from "./tools";

// TODO
const DiffSyntax = ({
  rawLine,
  diffLine,
  operator,
  syntaxLine,
}: {
  rawLine: string;
  diffLine?: DiffLine;
  syntaxLine?: SyntaxLine;
  operator?: "add" | "del";
  enableWrap?: boolean;
}) => {
  if (!syntaxLine) {
    return <DiffString rawLine={rawLine} diffLine={diffLine} operator={operator} />;
  }
};

const DiffString = ({
  rawLine,
  diffLine,
  operator,
  enableWrap,
}: {
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  enableWrap?: boolean;
}) => {
  const diffRange = diffLine?.diffChanges;

  const isAdd = operator === "add";

  if (diffRange.hasLineChange) {
    const targetRange = diffRange.range;

    const isNewLineSymbolChanged = diffRange.newLineSymbol;

    const newLineSymbol =
      isNewLineSymbolChanged === NewLineSymbol.CRLF
        ? "␍␊"
        : isNewLineSymbolChanged === NewLineSymbol.CR
          ? "␍"
          : isNewLineSymbolChanged === NewLineSymbol.LF
            ? "␊"
            : "";

    const hasNoTrailingNewLine = isNewLineSymbolChanged === NewLineSymbol.NEWLINE;

    return (
      <span className="diff-line-content-raw">
        {targetRange.map((item, index) => {
          const type = item[0];
          const str = item[1];
          if (type === 0) {
            return <span key={index}>{str}</span>;
          } else {
            return (
              <span
                key={index}
                data-diff-highlight
                className="rounded-[0.2em]"
                style={{
                  backgroundColor: isAdd ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
                }}
              >
                {str}
              </span>
            );
          }
        })}

        {newLineSymbol && (
          <span
            data-newline-symbol
            data-diff-highlight
            className="rounded-[0.2em]"
            style={{
              backgroundColor: isAdd ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
            }}
          >
            {newLineSymbol}
          </span>
        )}

        {hasNoTrailingNewLine && (
          <span
            data-no-newline-at-end-of-file
            className={enableWrap ? "block text-red-500" : "inline-block align-middle text-red-500"}
            style={{
              width: `var(${diffFontSizeName})`,
              height: `var(${diffFontSizeName})`,
            }}
          >
            <DiffNoNewLine />
          </span>
        )}
      </span>
    );
  } else {
    return <span className="diff-line-content-raw">{rawLine}</span>;
  }
};

export const DiffContent_v2 = ({
  diffLine,
  rawLine,
  syntaxLine,
  enableWrap,
  enableHighlight,
}: {
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
}) => {
  const isAdded = diffLine?.type === DiffLineType.Add;

  const isDelete = diffLine?.type === DiffLineType.Delete;

  const isMaxLineLengthToIgnoreSyntax = syntaxLine?.nodeList?.length > 150;

  return (
    <div
      className="diff-line-content-item pl-[2.0em]"
      data-val={rawLine}
      style={{
        whiteSpace: enableWrap ? "pre-wrap" : "pre",
        wordBreak: enableWrap ? "break-all" : "initial",
      }}
    >
      <span
        data-operator={isAdded ? "+" : isDelete ? "-" : undefined}
        className="diff-line-content-operator ml-[-1.5em] inline-block w-[1.5em] select-none indent-[0.2em]"
      >
        {isAdded ? "+" : isDelete ? "-" : " "}
      </span>
      {enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? (
        <DiffSyntax
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
          enableWrap={enableWrap}
        />
      ) : (
        <DiffString
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          enableWrap={enableWrap}
        />
      )}
    </div>
  );
};
