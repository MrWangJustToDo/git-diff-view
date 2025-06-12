import {
  DiffLineType,
  getPlainDiffTemplate,
  getPlainLineTemplate,
  getSyntaxDiffTemplate,
  getSyntaxLineTemplate,
} from "@git-diff-view/core";
import {
  addContentHighlightBGName,
  delContentHighlightBGName,
  diffFontSizeName,
  getSymbol,
  NewLineSymbol,
} from "@git-diff-view/utils";

import { DiffNoNewLine } from "./DiffNoNewLine";

import type { DiffFile, DiffLine, File } from "@git-diff-view/core";

const DiffString = ({
  rawLine,
  diffLine,
  operator,
  plainLine,
  enableWrap,
}: {
  rawLine: string;
  diffLine?: DiffLine;
  plainLine?: File["plainFile"][number];
  operator?: "add" | "del";
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
        <span class="diff-line-content-raw">
          <span data-template innerHTML={diffLine.plainTemplate} />
          {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              class={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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
      // TODO remove
      const range = changes.range;
      const str1 = rawLine.slice(0, range.location);
      const str2 = rawLine.slice(range.location, range.location + range.length);
      const str3 = rawLine.slice(range.location + range.length);
      const isLast = str2.includes("\n");
      const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
      return (
        <span class="diff-line-content-raw">
          <span data-range-start={range.location} data-range-end={range.location + range.length}>
            {str1}
            <span
              data-diff-highlight
              class="rounded-[0.2em]"
              style={{
                backgroundColor:
                  operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
              }}
            >
              {isLast ? (
                <>
                  {_str2}
                  <span data-newline-symbol>{getSymbol(isNewLineSymbolChanged)}</span>
                </>
              ) : (
                str2
              )}
            </span>
            {str3}
          </span>
          {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              class={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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
      <span class="diff-line-content-raw">
        <span data-template innerHTML={plainLine.template} />
      </span>
    );
  }

  return <span class="diff-line-content-raw">{rawLine}</span>;
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
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
  enableWrap?: boolean;
}) => {
  if (!syntaxLine) {
    return <DiffString rawLine={rawLine} diffLine={diffLine} operator={operator} />;
  }

  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    if (!diffLine?.syntaxTemplate && typeof getSyntaxDiffTemplate === "function") {
      getSyntaxDiffTemplate({ diffLine, syntaxLine, operator });
    }

    if (diffLine?.syntaxTemplate) {
      return (
        <span class="diff-line-syntax-raw">
          <span data-template innerHTML={diffLine.syntaxTemplate} />
          {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              class={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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
      // TODO remove
      const range = changes.range;

      return (
        <span class="diff-line-syntax-raw">
          <span data-range-start={range.location} data-range-end={range.location + range.length}>
            {syntaxLine.nodeList?.map(({ node, wrapper }, index) => {
              if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
                return (
                  <span
                    key={index}
                    data-start={node.startIndex}
                    data-end={node.endIndex}
                    class={wrapper?.properties?.className?.join(" ")}
                    style={wrapper?.properties?.style}
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
                const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
                return (
                  <span
                    key={index}
                    data-start={node.startIndex}
                    data-end={node.endIndex}
                    class={wrapper?.properties?.className?.join(" ")}
                    style={wrapper?.properties?.style}
                  >
                    {str1}
                    <span
                      data-diff-highlight
                      style={{
                        backgroundColor:
                          operator === "add"
                            ? `var(${addContentHighlightBGName})`
                            : `var(${delContentHighlightBGName})`,
                        borderTopLeftRadius: isStart ? "0.2em" : undefined,
                        borderBottomLeftRadius: isStart ? "0.2em" : undefined,
                        borderTopRightRadius: isEnd || isLast ? "0.2em" : undefined,
                        borderBottomRightRadius: isEnd || isLast ? "0.2em" : undefined,
                      }}
                    >
                      {isLast ? (
                        <>
                          {_str2}
                          <span data-newline-symbol>{getSymbol(isNewLineSymbolChanged)}</span>
                        </>
                      ) : (
                        str2
                      )}
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
              class={enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
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

  if (syntaxLine.template) {
    return (
      <span class="diff-line-syntax-raw">
        <span data-template innerHTML={syntaxLine.template} />
      </span>
    );
  }

  return (
    <span class="diff-line-syntax-raw">
      {syntaxLine?.nodeList?.map(({ node, wrapper }, index) => (
        <span
          key={index}
          data-start={node.startIndex}
          data-end={node.endIndex}
          class={wrapper?.properties?.className?.join(" ")}
          style={wrapper?.properties?.style}
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
      class="diff-line-content-item pl-[2.0em]"
      // data-val={rawLine}
      style={{
        whiteSpace: enableWrap ? "pre-wrap" : "pre",
        wordBreak: enableWrap ? "break-all" : "initial",
      }}
    >
      <span
        data-operator={isAdded ? "+" : isDelete ? "-" : undefined}
        class="diff-line-content-operator ml-[-1.5em] inline-block w-[1.5em] select-none indent-[0.2em]"
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
          plainLine={plainLine}
          enableWrap={enableWrap}
        />
      )}
    </div>
  );
};
