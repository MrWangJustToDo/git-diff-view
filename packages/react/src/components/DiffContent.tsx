/* eslint-disable max-lines */
import {
  DiffLineType,
  getSyntaxDiffTemplate,
  getSyntaxLineTemplate,
  getPlainDiffTemplate,
  getPlainLineTemplate,
} from "@git-diff-view/core";
import { memoFunc, diffFontSizeName, NewLineSymbol } from "@git-diff-view/utils";
import * as React from "react";

import { DiffNoNewLine } from "./DiffNoNewLine";

import type { DiffFile, DiffLine, File } from "@git-diff-view/core";

const temp = {};

const formatStringToCamelCase = (str: string) => {
  if (str.startsWith("--")) return str;
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
  plainLine,
  enableWrap,
}: {
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  plainLine?: File["plainFile"][number];
  enableWrap?: boolean;
}) => {
  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    if (!diffLine?.plainTemplate && typeof getPlainDiffTemplate === "function") {
      getPlainDiffTemplate({ diffLine, rawLine, operator });
    }

    if (diffLine?.plainTemplate) {
      return (
        <span className="diff-line-content-raw">
          <span data-template dangerouslySetInnerHTML={{ __html: diffLine.plainTemplate }} />
          {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              className={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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
  }

  if (plainLine && !plainLine?.template) {
    plainLine.template = getPlainLineTemplate(plainLine.value);
  }

  if (plainLine?.template) {
    return (
      <span className="diff-line-content-raw">
        <span data-template dangerouslySetInnerHTML={{ __html: plainLine.template }} />
      </span>
    );
  }

  return <span className="diff-line-content-raw">{rawLine}</span>;
};

const DiffSyntax = ({
  rawLine,
  diffFile,
  diffLine,
  operator,
  syntaxLine,
  enableWrap,
}: {
  rawLine: string;
  diffFile: DiffFile;
  diffLine?: DiffLine;
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
  enableWrap?: boolean;
}) => {
  if (!syntaxLine) {
    return <DiffString rawLine={rawLine} diffLine={diffLine} operator={operator} enableWrap={enableWrap} />;
  }

  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    if (!diffLine?.syntaxTemplate && typeof getSyntaxDiffTemplate === "function") {
      getSyntaxDiffTemplate({ diffFile, diffLine, syntaxLine, operator });
    }

    if (diffLine?.syntaxTemplate) {
      return (
        <span className="diff-line-syntax-raw">
          <span data-template dangerouslySetInnerHTML={{ __html: diffLine.syntaxTemplate }} />
          {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              className={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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
  }

  if (!syntaxLine.template) {
    syntaxLine.template = getSyntaxLineTemplate(syntaxLine);
  }

  if (syntaxLine?.template) {
    return (
      <span className="diff-line-syntax-raw">
        <span data-template dangerouslySetInnerHTML={{ __html: syntaxLine.template }} />
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
  diffFile,
  diffLine,
  rawLine,
  plainLine,
  syntaxLine,
  enableWrap,
  enableHighlight,
}: {
  rawLine: string;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
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
          diffFile={diffFile}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
          enableWrap={enableWrap}
        />
      ) : (
        <DiffString
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          plainLine={plainLine}
          enableWrap={enableWrap}
        />
      )}
    </div>
  );
};
