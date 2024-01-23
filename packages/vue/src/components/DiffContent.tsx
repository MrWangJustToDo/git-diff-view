import { DiffLineType, type DiffFile, type DiffLine, type SyntaxLine } from "@git-diff-view/core";

import { addContentHighlightBGName, delContentHighlightBGName } from "./color";

const DiffString = ({ rawLine, diffLine, operator }: { rawLine: string; diffLine?: DiffLine; operator?: "add" | "del" }) => {
  const range = diffLine?.range;

  if (range && range.length > 0 && range.length < rawLine.length) {
    return (
      <span class="diff-line-content-raw">
        <span data-range-start={range.location} data-range-end={range.location + range.length}>
          {rawLine.slice(0, range.location)}
          <span
            data-diff-highlight
            class="rounded-[0.2em]"
            style={{
              backgroundColor: operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
            }}
          >
            {rawLine.slice(range.location, range.location + range.length)}
          </span>
          {rawLine.slice(range.location + range.length)}
        </span>
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
}: {
  rawLine: string;
  diffLine?: DiffLine;
  syntaxLine?: SyntaxLine;
  operator?: "add" | "del";
}) => {
  if (!syntaxLine) {
    return <DiffString rawLine={rawLine} diffLine={diffLine} operator={operator} />;
  }

  const range = diffLine?.range;

  if (range && range.length > 0 && range.length < syntaxLine.valueLength) {
    return (
      <span class="diff-line-syntax-raw">
        <span data-range-start={range.location} data-range-end={range.location + range.length}>
          {syntaxLine.nodeList?.map(({ node, wrapper }, index) => {
            if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
              return (
                <span key={index} data-start={node.startIndex} data-end={node.endIndex} class={wrapper?.properties?.className?.join(" ")}>
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
              return (
                <span key={index} data-start={node.startIndex} data-end={node.endIndex} class={wrapper?.properties?.className?.join(" ")}>
                  {str1}
                  <span
                    data-diff-highlight
                    style={{
                      backgroundColor: operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
                      borderTopLeftRadius: isStart ? "0.2em" : undefined,
                      borderBottomLeftRadius: isStart ? "0.2em" : undefined,
                      borderTopRightRadius: isEnd ? "0.2em" : undefined,
                      borderBottomRightRadius: isEnd ? "0.2em" : undefined,
                    }}
                  >
                    {str2}
                  </span>
                  {str3}
                </span>
              );
            }
          })}
        </span>
      </span>
    );
  }

  return (
    <span class="diff-line-syntax-raw">
      {syntaxLine?.nodeList?.map(({ node, wrapper }, index) => (
        <span key={index} data-start={node.startIndex} data-end={node.endIndex} class={wrapper?.properties?.className?.join(" ")}>
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

  return (
    <div
      class="diff-line-content-item pl-[2.0em]"
      data-val={rawLine}
      style={{
        whiteSpace: enableWrap ? "pre-wrap" : "pre",
        wordBreak: enableWrap ? "break-all" : "initial",
      }}
    >
      <span
        data-operator={isAdded ? "+" : isDelete ? "-" : undefined}
        class="diff-line-content-operator inline-block w-[1.5em] ml-[-1.5em] indent-[0.2em] select-none"
      >
        {isAdded ? "+" : isDelete ? "-" : " "}
      </span>
      {enableHighlight && syntaxLine ? (
        <DiffSyntax operator={isAdded ? "add" : isDelete ? "del" : undefined} rawLine={rawLine} diffLine={diffLine} syntaxLine={syntaxLine} />
      ) : (
        <DiffString operator={isAdded ? "add" : isDelete ? "del" : undefined} rawLine={rawLine} diffLine={diffLine} />
      )}
    </div>
  );
};