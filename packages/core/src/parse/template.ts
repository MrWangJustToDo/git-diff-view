import { addContentHighlightBGName, delContentHighlightBGName, getSymbol } from "@git-diff-view/utils";

import { escapeHtml } from "../escape-html";

import { doPreTransform, doAfterTransform } from "./transform";

import type { SyntaxLineWithTemplate } from "../file";
import type { DiffLine } from "./diff-line";
import type { SyntaxLine } from "@git-diff-view/lowlight";

export const getPlainDiffTemplate = ({
  diffLine,
  rawLine,
  operator,
}: {
  diffLine: DiffLine;
  rawLine: string;
  operator: "add" | "del";
}) => {
  if (diffLine.plainTemplate) return;

  const changes = diffLine.changes;

  if (!changes || !changes.hasLineChange || !rawLine) return;

  const range = changes.range;
  const str1 = rawLine.slice(0, range.location);
  const str2 = rawLine.slice(range.location, range.location + range.length);
  const str3 = rawLine.slice(range.location + range.length);
  const isLast = str2.includes("\n");
  const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
  const isNewLineSymbolChanged = changes.newLineSymbol;

  const template = `<span data-range-start="${range.location}" data-range-end="${
    range.location + range.length
  }">${doAfterTransform(escapeHtml(doPreTransform(str1)))}<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-radius: 0.2em;">${
    isLast
      ? `${doAfterTransform(escapeHtml(doPreTransform(_str2)))}<span data-newline-symbol>${getSymbol(isNewLineSymbolChanged)}</span>`
      : doAfterTransform(escapeHtml(doPreTransform(str2)))
  }</span>${doAfterTransform(escapeHtml(doPreTransform(str3)))}</span>`;

  diffLine.plainTemplate = template;
};

export const getSyntaxDiffTemplate = ({
  diffLine,
  syntaxLine,
  operator,
}: {
  diffLine: DiffLine;
  syntaxLine: SyntaxLineWithTemplate;
  operator: "add" | "del";
}) => {
  if (diffLine.syntaxTemplate || !syntaxLine) return;

  const changes = diffLine.changes;

  if (!changes || !changes.hasLineChange) return;

  const range = changes.range;

  let template = `<span data-range-start="${range.location}" data-range-end="${range.location + range.length}">`;

  syntaxLine?.nodeList?.forEach(({ node, wrapper }) => {
    if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
      template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
        wrapper?.properties?.className || []
      )?.join(" ")}" style="${wrapper?.properties?.style || ""}">${doAfterTransform(escapeHtml(doPreTransform(node.value)))}</span>`;
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
      template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
        wrapper?.properties?.className || []
      )?.join(
        " "
      )}" style="${wrapper?.properties?.style || ""}">${doAfterTransform(escapeHtml(doPreTransform(str1)))}<span data-diff-highlight style="background-color: var(${operator === "add" ? addContentHighlightBGName : delContentHighlightBGName});border-top-left-radius: ${isStart ? "0.2em" : "0"};border-bottom-left-radius: ${isStart ? "0.2em" : "0"};border-top-right-radius: ${isEnd || isLast ? "0.2em" : "0"};border-bottom-right-radius: ${isEnd || isLast ? "0.2em" : "0"}">${
        isLast
          ? `${doAfterTransform(escapeHtml(doPreTransform(_str2)))}<span data-newline-symbol>${getSymbol(changes.newLineSymbol)}</span>`
          : doAfterTransform(escapeHtml(doPreTransform(str2)))
      }</span>${doAfterTransform(escapeHtml(doPreTransform(str3)))}</span>`;
    }
  });

  template += "</span>";

  diffLine.syntaxTemplate = template;
};

export const getSyntaxLineTemplate = (line: SyntaxLine) => {
  let template = "";

  line?.nodeList?.forEach(({ node, wrapper }) => {
    template += `<span data-start="${node.startIndex}" data-end="${node.endIndex}" class="${(
      wrapper?.properties?.className || []
    )?.join(" ")}" style="${wrapper?.properties?.style || ""}">${doAfterTransform(escapeHtml(doPreTransform(node.value)))}</span>`;
  });

  return template;
};

export const getPlainLineTemplate = (line: string) => {
  if (!line) return "";

  const template = doAfterTransform(escapeHtml(doPreTransform(line)));

  return template;
};
