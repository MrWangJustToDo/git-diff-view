import { DiffLineType, NewLineSymbol, type DiffFile, type DiffLine, type SyntaxLine } from "@git-diff-view/core";
import * as React from "react";

import { addContentHighlightBGName, delContentHighlightBGName } from "./color";
import { DiffNoNewLine } from "./DiffNoNewLine";
import { diffFontSizeName, memoFunc } from "./tools";

const temp = {};

const formatStringToCamelCase = (str: string) => {
  if (str.startsWith('--')) return str;
  const splitted = str.split("-");
  if (splitted.length === 1) return splitted[0];
  return (
    splitted[0] +
    splitted
      .slice(1)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("")
  );
};

export const getStyleObjectFromString = memoFunc((str: string) => {
  if (!str) return temp;
  const style = {};
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    if (!property) return;

    const formattedProperty = formatStringToCamelCase(property.trim());
    style[formattedProperty] = value.trim();
  });
  return style;
});

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
  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const range = changes.range;
    const str1 = rawLine.slice(0, range.location);
    const str2 = rawLine.slice(range.location, range.location + range.length);
    const str3 = rawLine.slice(range.location + range.length);
    const isLast = str2.includes("\n");
    const _str2 = isLast ? str2.replace("\n", "") : str2;
    const isNewLineSymbolChanged = changes.newLineSymbol;
    return (
      <span className="diff-line-content-raw">
        <span data-range-start={range.location} data-range-end={range.location + range.length}>
          {str1}
          <span
            data-diff-highlight
            className="rounded-[0.2em]"
            style={{
              backgroundColor:
                operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
            }}
          >
            {isLast
              ? `${_str2}${
                  isNewLineSymbolChanged === NewLineSymbol.LF
                    ? "␊"
                    : isNewLineSymbolChanged === NewLineSymbol.CR
                      ? "␍"
                      : isNewLineSymbolChanged === NewLineSymbol.CRLF
                        ? "␍␊"
                        : ""
                }`
              : str2}
          </span>
          {str3}
        </span>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
          <span
            data-no-newline-at-end-of-file-symbol
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
  }

  return <span className="diff-line-content-raw">{rawLine}</span>;
};

const DiffSyntax = ({
  rawLine,
  diffLine,
  operator,
  syntaxLine,
  enableWrap,
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

  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    const range = changes.range;

    return (
      <span className="diff-line-syntax-raw">
        <span data-range-start={range.location} data-range-end={range.location + range.length}>
          {syntaxLine.nodeList?.map(({ node, wrapper }, index) => {
            if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
              return (
                <span
                  key={index}
                  data-start={node.startIndex}
                  data-end={node.endIndex}
                  className={wrapper?.properties?.className?.join(" ")}
                  style={getStyleObjectFromString(wrapper?.properties?.style || "")}
                >
                  {node.value}
                </span>
              );
            } else {
              const index1 = range.location - node.startIndex;
              const index2 = index1 < 0 ? 0 : index1;
              const str1 = node.value.slice(0, index2);
              const str2 = node.value.slice(index2, index1 + range.length);
              const str3 = node.value.slice(index1 + range.length);
              const isStart = str1.length || range.location === node.startIndex;
              const isEnd = str3.length || node.endIndex === range.location + range.length - 1;
              const isLast = str2.includes("\n");
              const _str2 = isLast ? str2.replace("\n", "") : str2;
              return (
                <span
                  key={index}
                  data-start={node.startIndex}
                  data-end={node.endIndex}
                  className={wrapper?.properties?.className?.join(" ")}
                  style={getStyleObjectFromString(wrapper?.properties?.style || "")}
                >
                  {str1}
                  <span
                    data-diff-highlight
                    style={{
                      backgroundColor:
                        operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
                      borderTopLeftRadius: isStart ? "0.2em" : undefined,
                      borderBottomLeftRadius: isStart ? "0.2em" : undefined,
                      borderTopRightRadius: isEnd || isLast ? "0.2em" : undefined,
                      borderBottomRightRadius: isEnd || isLast ? "0.2em" : undefined,
                    }}
                  >
                    {isLast
                      ? `${_str2}${
                          isNewLineSymbolChanged === NewLineSymbol.LF
                            ? "␊"
                            : isNewLineSymbolChanged === NewLineSymbol.CR
                              ? "␍"
                              : isNewLineSymbolChanged === NewLineSymbol.CRLF
                                ? "␍␊"
                                : ""
                        }`
                      : str2}
                  </span>
                  {str3}
                </span>
              );
            }
          })}
        </span>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
          <span
            data-no-newline-at-end-of-file-symbol
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
  }

  return (
    <span className="diff-line-syntax-raw">
      {syntaxLine?.nodeList?.map(({ node, wrapper }, index) => (
        <span
          key={index}
          data-start={node.startIndex}
          data-end={node.endIndex}
          className={wrapper?.properties?.className?.join(" ")}
          style={getStyleObjectFromString(wrapper?.properties?.style || "")}
        >
          {node.value}
        </span>
      ))}
    </span>
  );
};

export const DiffContent = ({
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
      // data-val={rawLine}
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
