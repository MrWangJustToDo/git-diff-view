import {
  DiffLineType,
  getSyntaxDiffTemplate,
  type File,
  type DiffFile,
  type DiffLine,
  getSyntaxLineTemplate,
  getPlainDiffTemplate,
  getPlainLineTemplate,
} from "@git-diff-view/core";
import {
  addContentHighlightBGName,
  delContentHighlightBGName,
  diffFontSizeName,
  getSymbol,
  NewLineSymbol,
} from "@git-diff-view/utils";
import { createMemo, For, Show } from "solid-js";

import { DiffNoNewLine } from "./DiffNoNewLine";

const DiffString = (props: {
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  plainLine?: File["plainFile"][number];
  enableWrap?: boolean;
  enableTemplate?: boolean;
}) => {
  const getRange = () => props.diffLine?.changes?.range;

  const getStr1 = () => props.rawLine.slice(0, getRange?.()?.location);

  const getStr2 = () =>
    props.rawLine.slice(getRange?.()?.location, (getRange?.()?.location || 0) + (getRange?.()?.length || 0));

  const getStr3 = () => props.rawLine.slice((getRange?.()?.location || 0) + (getRange?.()?.length || 0));

  const getIsLast = () => getStr2().includes("\n");

  const get_Str2 = () => (getIsLast() ? getStr2().replace("\n", "").replace("\r", "") : getStr2());

  const getIsNewLineSymbolChanged = () => (getStr3() === "" ? props.diffLine?.changes?.newLineSymbol : null);

  const initTemplateIfNeed = () => {
    if (
      props.enableTemplate &&
      props.operator &&
      props.diffLine &&
      !props.diffLine?.plainTemplate &&
      typeof getPlainDiffTemplate === "function"
    ) {
      getPlainDiffTemplate({ diffLine: props.diffLine, rawLine: props.rawLine, operator: props.operator });
    }

    if (props.enableTemplate && props.plainLine && !props.plainLine.template) {
      props.plainLine.template = getPlainLineTemplate(props.plainLine.value);
    }
  };

  // eslint-disable-next-line solid/reactivity
  createMemo(initTemplateIfNeed);

  return (
    <Show
      when={props.diffLine?.changes?.hasLineChange}
      fallback={
        <Show
          when={props.enableTemplate && props.plainLine?.template}
          fallback={<span class="diff-line-content-raw">{props.rawLine}</span>}
        >
          <span class="diff-line-content-raw">
            {/* eslint-disable-next-line solid/no-innerhtml */}
            <span data-template innerHTML={props.plainLine?.template} />
          </span>
        </Show>
      }
    >
      <Show
        when={props.enableTemplate && props.diffLine?.plainTemplate}
        fallback={
          <span class="diff-line-content-raw">
            <span
              data-range-start={getRange()?.location}
              data-range-end={(getRange()?.location || 0) + (getRange()?.length || 0)}
            >
              {getStr1()}
              <span
                data-diff-highlight
                class="rounded-[0.2em]"
                style={{
                  "background-color":
                    props.operator === "add"
                      ? `var(${addContentHighlightBGName})`
                      : `var(${delContentHighlightBGName})`,
                }}
              >
                {getIsLast() ? (
                  <>
                    {get_Str2()}
                    <span data-newline-symbol>{getSymbol(getIsNewLineSymbolChanged())}</span>
                  </>
                ) : (
                  getStr2()
                )}
              </span>
              {getStr3()}
            </span>
            {getIsNewLineSymbolChanged() === NewLineSymbol.NEWLINE && (
              <span
                data-no-newline-at-end-of-file-symbol
                class={props.enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
                style={{
                  width: `var(${diffFontSizeName})`,
                  height: `var(${diffFontSizeName})`,
                }}
              >
                <DiffNoNewLine />
              </span>
            )}
          </span>
        }
      >
        <span class="diff-line-content-raw">
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <span data-template innerHTML={props.diffLine?.plainTemplate} />
          {getIsNewLineSymbolChanged() === NewLineSymbol.NEWLINE && (
            <span
              data-no-newline-at-end-of-file-symbol
              class={props.enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
              style={{
                width: `var(${diffFontSizeName})`,
                height: `var(${diffFontSizeName})`,
              }}
            >
              <DiffNoNewLine />
            </span>
          )}
        </span>
      </Show>
    </Show>
  );
};

const DiffSyntax = (props: {
  rawLine: string;
  diffLine?: DiffLine;
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
  enableWrap?: boolean;
  enableTemplate?: boolean;
}) => {
  const getRange = () => props.diffLine?.changes?.range;

  const getIsNewLineSymbolChanged = () => props.diffLine?.changes?.newLineSymbol;

  const initTemplateIfNeed = () => {
    if (
      props.enableTemplate &&
      props.diffLine &&
      props.syntaxLine &&
      props.operator &&
      !props.diffLine?.syntaxTemplate &&
      typeof getSyntaxDiffTemplate === "function"
    ) {
      getSyntaxDiffTemplate({ diffLine: props.diffLine, syntaxLine: props.syntaxLine, operator: props.operator });
    }

    if (props.enableTemplate && props.syntaxLine && !props.syntaxLine?.template) {
      props.syntaxLine.template = getSyntaxLineTemplate(props.syntaxLine);
    }
  };

  // eslint-disable-next-line solid/reactivity
  createMemo(initTemplateIfNeed);

  return (
    <Show
      when={props.syntaxLine}
      fallback={
        <DiffString
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          operator={props.operator}
          enableWrap={props.enableWrap}
          enableTemplate={props.enableTemplate}
        />
      }
    >
      <Show
        when={props.diffLine?.changes?.hasLineChange}
        fallback={
          <Show
            when={props.enableTemplate && props.syntaxLine?.template}
            fallback={
              <span class="diff-line-syntax-raw">
                <For each={props.syntaxLine?.nodeList || []}>
                  {({ node, wrapper }) => (
                    <span
                      data-start={node.startIndex}
                      data-end={node.endIndex}
                      class={wrapper?.properties?.className?.join(" ")}
                      style={wrapper?.properties?.style}
                    >
                      {node.value}
                    </span>
                  )}
                </For>
              </span>
            }
          >
            <span class="diff-line-syntax-raw">
              {/* eslint-disable-next-line solid/no-innerhtml */}
              <span data-template innerHTML={props.syntaxLine?.template} />
            </span>
          </Show>
        }
      >
        <Show
          when={props.enableTemplate && props.diffLine?.syntaxTemplate}
          fallback={
            <span class="diff-line-syntax-raw">
              <span
                data-range-start={getRange()?.location}
                data-range-end={(getRange()?.location || 0) + (getRange()?.length || 0)}
              >
                <For each={props.syntaxLine?.nodeList}>
                  {({ node, wrapper }) => {
                    if (
                      node.endIndex < getRange()!.location ||
                      getRange()!.location + getRange()!.length < node.startIndex
                    ) {
                      return (
                        <span
                          data-start={node.startIndex}
                          data-end={node.endIndex}
                          class={wrapper?.properties?.className?.join(" ")}
                          style={wrapper?.properties?.style}
                        >
                          {node.value}
                        </span>
                      );
                    } else {
                      const index1 = getRange()!.location - node.startIndex;
                      const index2 = index1 < 0 ? 0 : index1;
                      const str1 = node.value.slice(0, index2);
                      const str2 = node.value.slice(index2, index1 + getRange()!.length);
                      const str3 = node.value.slice(index1 + getRange()!.length);
                      const isStart = str1.length || getRange()!.location === node.startIndex;
                      const isEnd = str3.length || node.endIndex === getRange()!.location + getRange()!.length - 1;
                      const isLast = str2.includes("\n");
                      const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
                      return (
                        <span
                          data-start={node.startIndex}
                          data-end={node.endIndex}
                          class={wrapper?.properties?.className?.join(" ")}
                          style={wrapper?.properties?.style}
                        >
                          {str1}
                          <span
                            data-diff-highlight
                            style={{
                              "background-color":
                                props.operator === "add"
                                  ? `var(${addContentHighlightBGName})`
                                  : `var(${delContentHighlightBGName})`,
                              "border-top-left-radius": isStart ? "0.2em" : undefined,
                              "border-bottom-left-radius": isStart ? "0.2em" : undefined,
                              "border-top-right-radius": isEnd || isLast ? "0.2em" : undefined,
                              "border-bottom-right-radius": isEnd || isLast ? "0.2em" : undefined,
                            }}
                          >
                            {isLast ? (
                              <>
                                {_str2}
                                <span data-newline-symbol>{getSymbol(getIsNewLineSymbolChanged())}</span>
                              </>
                            ) : (
                              str2
                            )}
                          </span>
                          {str3}
                        </span>
                      );
                    }
                  }}
                </For>
              </span>
              {getIsNewLineSymbolChanged() === NewLineSymbol.NEWLINE && (
                <span
                  data-no-newline-at-end-of-file-symbol
                  class={props.enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
                  style={{
                    width: `var(${diffFontSizeName})`,
                    height: `var(${diffFontSizeName})`,
                  }}
                >
                  <DiffNoNewLine />
                </span>
              )}
            </span>
          }
        >
          <span class="diff-line-syntax-raw">
            {/* eslint-disable-next-line solid/no-innerhtml */}
            <span data-template innerHTML={props.diffLine?.syntaxTemplate} />
            {getIsNewLineSymbolChanged() === NewLineSymbol.NEWLINE && (
              <span
                data-no-newline-at-end-of-file-symbol
                class={props.enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500"}
                style={{
                  width: `var(${diffFontSizeName})`,
                  height: `var(${diffFontSizeName})`,
                }}
              >
                <DiffNoNewLine />
              </span>
            )}
          </span>
        </Show>
      </Show>
    </Show>
  );
};

export const DiffContent = (props: {
  rawLine: string;
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
}) => {
  const getIsAdded = () => props.diffLine?.type === DiffLineType.Add;

  const getIsDelete = () => props.diffLine?.type === DiffLineType.Delete;

  const getIsMaxLineLengthToIgnoreSyntax = () =>
    props.syntaxLine?.nodeList ? props.syntaxLine?.nodeList?.length > 150 : false;

  const getIsEnableTemplate = () => props.diffFile.getIsEnableTemplate?.() ?? true;

  return (
    <div
      class="diff-line-content-item pl-[2.0em]"
      style={{
        "white-space": props.enableWrap ? "pre-wrap" : "pre",
        "word-break": props.enableWrap ? "break-all" : "initial",
      }}
    >
      <span
        data-operator={getIsAdded() ? "+" : getIsDelete() ? "-" : undefined}
        class="diff-line-content-operator ml-[-1.5em] inline-block w-[1.5em] select-none indent-[0.2em]"
      >
        {getIsAdded() ? "+" : getIsDelete() ? "-" : " "}
      </span>
      {props.enableHighlight && props.syntaxLine && !getIsMaxLineLengthToIgnoreSyntax() ? (
        <DiffSyntax
          operator={getIsAdded() ? "add" : getIsDelete() ? "del" : undefined}
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          syntaxLine={props.syntaxLine}
          enableWrap={props.enableWrap}
          enableTemplate={getIsEnableTemplate()}
        />
      ) : (
        <DiffString
          operator={getIsAdded() ? "add" : getIsDelete() ? "del" : undefined}
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          enableWrap={props.enableWrap}
          enableTemplate={getIsEnableTemplate()}
        />
      )}
    </div>
  );
};
