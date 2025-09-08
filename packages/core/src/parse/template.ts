import { addContentHighlightBGName, delContentHighlightBGName, getSymbol } from "@git-diff-view/utils";

import { escapeHtml } from "../escape-html";

import { processTransformTemplateContent, isTransformEnabled } from "./transform";

import type { DiffLine } from "./diff-line";
import type { SyntaxLine } from "@git-diff-view/lowlight";

let enableFastDiffTemplate = false;

export const getEnableFastDiffTemplate = () => enableFastDiffTemplate;

export const setEnableFastDiffTemplate = (enable: boolean) => {
  enableFastDiffTemplate = enable;
};

export const resetEnableFastDiffTemplate = () => {
  enableFastDiffTemplate = false;
};

export const defaultTransform = (content: string) => escapeHtml(content).replace(/\n/g, "").replace(/\r/g, "");

export const getPlainDiffTemplate = ({
  diffLine,
  rawLine,
  operator,
}: {
  diffLine: DiffLine;
  rawLine: string;
  operator: "add" | "del";
}) => {
  if (diffLine.plainTemplate && diffLine.plainTemplateMode === "relative") return;

  const changes = diffLine.changes;

  if (!changes || !changes.hasLineChange || !rawLine) return;

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  const range = changes.range;

  const str1 = rawLine.slice(0, range.location);

  const str2 = rawLine.slice(range.location, range.location + range.length);

  const str3 = rawLine.slice(range.location + range.length);

  const isLast = str2.includes("\n");

  const isNewLineSymbolChanged = changes.newLineSymbol;

  let template = `<span data-range-start="${range.location}" data-range-end="${range.location + range.length}">`;

  template += transform(str1);

  template += `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">`;

  template += isLast
    ? `${transform(str2)}<span data-newline-symbol>${getSymbol(isNewLineSymbolChanged)}</span>`
    : transform(str2);

  template += `</span>`;

  template += transform(str3);

  template += `</span>`;

  diffLine.plainTemplate = template;

  diffLine.plainTemplateMode = "relative";
};

export const getPlainDiffTemplateByFastDiff = ({
  diffLine,
  rawLine,
  operator,
}: {
  diffLine: DiffLine;
  rawLine: string;
  operator: "add" | "del";
}) => {
  const changes = diffLine.diffChanges;

  if (!changes || !changes.hasLineChange || !rawLine) return;

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  let template = ``;

  changes.range.forEach(({ type, str, startIndex, endIndex }, index, array) => {
    const isLatest = index === array.length - 1;
    if (type === 0) {
      template += `<span>${transform(str)}`;
      template +=
        isLatest && changes.newLineSymbol
          ? `<span data-newline-symbol data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">${getSymbol(changes.newLineSymbol)}</span>`
          : "";
      template += `</span>`;
    } else {
      template += `<span data-range-start="${startIndex}" data-range-end="${endIndex}">`;
      template += `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">${transform(str)}`;
      template +=
        isLatest && changes.newLineSymbol
          ? `<span data-newline-symbol data-diff-highlight>${getSymbol(changes.newLineSymbol)}</span>`
          : "";
      template += `</span></span>`;
    }
  });

  diffLine.plainTemplate = template;

  diffLine.plainTemplateMode = "fast-diff";
};

export const getSyntaxDiffTemplate = ({
  diffLine,
  syntaxLine,
  operator,
}: {
  diffLine: DiffLine;
  syntaxLine: SyntaxLine;
  operator: "add" | "del";
}) => {
  if (!syntaxLine) return;

  if (diffLine.syntaxTemplate && diffLine.syntaxTemplateMode === "relative") return;

  const changes = diffLine.changes;

  if (!changes || !changes.hasLineChange) return;

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  const range = changes.range;

  let template = `<span data-range-start="${range.location}" data-range-end="${range.location + range.length}">`;

  syntaxLine?.nodeList?.forEach(({ node, wrapper }) => {
    if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
      template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
        wrapper?.properties?.className || []
      )?.join(" ")}" style="${wrapper?.properties?.style || ""}">${transform(node.value)}</span>`;
    } else {
      const index1 = range.location - node.startIndex;

      const index2 = index1 < 0 ? 0 : index1;

      const str1 = node.value.slice(0, index2);

      const str2 = node.value.slice(index2, index1 + range.length);

      const str3 = node.value.slice(index1 + range.length);

      const isStart = str1.length || range.location === node.startIndex;

      const isEnd = str3.length || node.endIndex === range.location + range.length - 1;

      const isLast = str2.includes("\n");

      template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
        wrapper?.properties?.className || []
      )?.join(
        " "
      )}" style="${wrapper?.properties?.style || ""}">${transform(str1)}<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-top-left-radius: ${isStart ? "0.2em" : "0"};border-bottom-left-radius: ${isStart ? "0.2em" : "0"};border-top-right-radius: ${isEnd || isLast ? "0.2em" : "0"};border-bottom-right-radius: ${isEnd || isLast ? "0.2em" : "0"}">${
        isLast
          ? `${transform(str2)}<span data-newline-symbol>${getSymbol(changes.newLineSymbol)}</span>`
          : transform(str2)
      }</span>${transform(str3)}</span>`;
    }
  });

  template += "</span>";

  diffLine.syntaxTemplate = template;

  diffLine.syntaxTemplateMode = "relative";
};

export const getSyntaxDiffTemplateByFastDiff = ({
  diffLine,
  syntaxLine,
  operator,
}: {
  diffLine: DiffLine;
  syntaxLine: SyntaxLine;
  operator: "add" | "del";
}) => {
  if (!syntaxLine) return;

  if (diffLine.syntaxTemplate && diffLine.syntaxTemplateMode === "fast-diff") return;

  const changes = diffLine.diffChanges;

  if (!changes || !changes.hasLineChange) return;

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  let template = "";

  const allRange = changes.range.filter((item) => item.type !== 0);

  let rangeIndex = 0;

  syntaxLine?.nodeList?.forEach(({ node, wrapper }, index, array) => {
    template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
      wrapper?.properties?.className || []
    )?.join(" ")}" style="${wrapper?.properties?.style || ""}">`;

    let range = allRange[rangeIndex];

    const isLastNode = index === array.length - 1;

    for (let i = 0; i < node.value.length; i++) {
      const index = node.startIndex + i;
      const value = node.value[i];
      const isLastStr = i === node.value.length - 1;
      const isEndStr = isLastNode && i === node.value.length - 1;
      if (range) {
        // before start
        if (index < range.startIndex) {
          template += transform(value);
          if (isEndStr && changes.newLineSymbol) {
            template += `<span data-newline-symbol data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">${getSymbol(changes.newLineSymbol)}</span>`;
          }
          // start of range
        } else if (index === range.startIndex) {
          // current range all in the same node
          const isInSameNode = range.endIndex <= node.endIndex;
          if (isInSameNode) {
            template += `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">`;
          } else {
            template += `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-top-left-radius: 0.2em;border-bottom-left-radius: 0.2em;">`;
          }
          template += transform(value);
          if (isEndStr && changes.newLineSymbol) {
            template += `<span data-newline-symbol>${getSymbol(changes.newLineSymbol)}</span>`;
          }
          if (isLastStr) {
            template += `</span>`;
          } else if (range.startIndex === range.endIndex) {
            template += `</span>`;
          }
          if (range.endIndex === index) {
            rangeIndex++;
            range = allRange[rangeIndex];
          }
          // inside range
        } else if (index < range.endIndex) {
          if (i === 0) {
            // current range all in the same node
            const isInSameNode = range.startIndex >= node.startIndex && range.endIndex <= node.endIndex;
            // current range end is in the same node
            const isEndInSameNode = range.endIndex <= node.endIndex;
            template += isInSameNode
              ? `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">`
              : isEndInSameNode
                ? `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-top-right-radius: 0.2em;border-bottom-right-radius: 0.2em;">`
                : // current range crosses the node boundary
                  `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});">`;
          }
          template += transform(value);
          if (isEndStr && changes.newLineSymbol) {
            template += `<span data-newline-symbol>${getSymbol(changes.newLineSymbol)}</span>`;
          }
          if (isLastStr) {
            template += `</span>`;
          }
          // end of range
        } else if (index === range.endIndex) {
          // current range all in the same node
          const isInSameNode = range.startIndex >= node.startIndex;
          if (isInSameNode) {
            template += transform(value);
          } else {
            if (i === 0) {
              template += `<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-top-right-radius: 0.2em;border-bottom-right-radius: 0.2em;">`;
            }
            template += transform(value);
          }
          if (isEndStr && changes.newLineSymbol) {
            template += `<span data-newline-symbol>${getSymbol(changes.newLineSymbol)}</span>`;
          }
          template += `</span>`;
          rangeIndex++;
          range = allRange[rangeIndex];
          // after range
        }
      } else {
        template += transform(value);
      }
    }
    template += `</span>`;
  });

  diffLine.syntaxTemplate = template;

  diffLine.syntaxTemplateMode = "fast-diff";
};

export const getSyntaxLineTemplate = (line: SyntaxLine) => {
  let template = "";

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  line?.nodeList?.forEach(({ node, wrapper }) => {
    template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
      wrapper?.properties?.className || []
    )?.join(" ")}" style="${wrapper?.properties?.style || ""}">${transform(node.value)}</span>`;
  });

  return template;
};

export const getPlainLineTemplate = (line: string) => {
  if (!line) return "";

  const transform = isTransformEnabled() ? processTransformTemplateContent : defaultTransform;

  const template = transform(line);

  return template;
};
