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
import { diffFontSizeName, NewLineSymbol } from "@git-diff-view/utils";
import { createMemo, For, Show } from "solid-js";

import { DiffNoNewLine } from "./DiffNoNewLine";

const DiffString = (props: {
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  plainLine?: File["plainFile"][number];
  enableWrap?: boolean;
}) => {
  const getIsNewLineSymbolChanged = () => props.diffLine?.changes?.newLineSymbol;

  const initTemplateIfNeed = () => {
    if (
      props.operator &&
      props.diffLine &&
      !props.diffLine?.plainTemplate &&
      typeof getPlainDiffTemplate === "function"
    ) {
      getPlainDiffTemplate({ diffLine: props.diffLine, rawLine: props.rawLine, operator: props.operator });
    }

    if (props.plainLine && !props.plainLine.template) {
      props.plainLine.template = getPlainLineTemplate(props.plainLine.value);
    }
  };

  // eslint-disable-next-line solid/reactivity
  createMemo(initTemplateIfNeed);

  return (
    <Show
      when={props.diffLine?.changes?.hasLineChange}
      fallback={
        <Show when={props.plainLine?.template} fallback={<span class="diff-line-content-raw">{props.rawLine}</span>}>
          <span class="diff-line-content-raw">
            {/* eslint-disable-next-line solid/no-innerhtml */}
            <span data-template innerHTML={props.plainLine?.template} />
          </span>
        </Show>
      }
    >
      <Show when={props.diffLine?.plainTemplate} fallback={<span class="diff-line-content-raw">{props.rawLine}</span>}>
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
  diffFile: DiffFile;
  diffLine?: DiffLine;
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
  enableWrap?: boolean;
}) => {
  const getIsNewLineSymbolChanged = () => props.diffLine?.changes?.newLineSymbol;

  const initTemplateIfNeed = () => {
    if (
      props.diffLine &&
      props.syntaxLine &&
      props.operator &&
      !props.diffLine?.syntaxTemplate &&
      typeof getSyntaxDiffTemplate === "function"
    ) {
      getSyntaxDiffTemplate({
        diffFile: props.diffFile,
        diffLine: props.diffLine,
        syntaxLine: props.syntaxLine,
        operator: props.operator,
      });
    }

    if (props.syntaxLine && !props.syntaxLine?.template) {
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
        />
      }
    >
      <Show
        when={props.diffLine?.changes?.hasLineChange}
        fallback={
          <Show
            when={props.syntaxLine?.template}
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
          when={props.diffLine?.syntaxTemplate}
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
  plainLine?: File["plainFile"][number];
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
          diffFile={props.diffFile}
          diffLine={props.diffLine}
          syntaxLine={props.syntaxLine}
          enableWrap={props.enableWrap}
        />
      ) : (
        <DiffString
          operator={getIsAdded() ? "add" : getIsDelete() ? "del" : undefined}
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          plainLine={props.plainLine}
          enableWrap={props.enableWrap}
        />
      )}
    </div>
  );
};
