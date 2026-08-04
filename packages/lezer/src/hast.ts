import { highlightTree } from "@lezer/highlight";

import { getCssVarHighlighter } from "./theme";

import type { Tree } from "@lezer/common";
import type { Highlighter } from "@lezer/highlight";
import type { Element, Root, Text } from "hast";

/**
 * Convert a styled Lezer tree into hast Root.
 * Token styles use `--diff-view-light` / `--diff-view-dark` CSS variables
 * (compatible with @git-diff-view/shiki rendering).
 */
export const treeToHast = (source: string, tree: Tree, highlighter: Highlighter = getCssVarHighlighter()): Root => {
  const children: Array<Element | Text> = [];
  let index = 0;

  highlightTree(tree, highlighter, (from, to, style) => {
    if (from > index) {
      children.push({ type: "text", value: source.slice(index, from) });
    }

    children.push({
      type: "element",
      tagName: "span",
      properties: style ? { style } : {},
      children: [{ type: "text", value: source.slice(from, to) }],
    });

    index = to;
  });

  if (index < source.length) {
    children.push({ type: "text", value: source.slice(index) });
  }

  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "code",
            properties: {},
            children,
          },
        ],
      },
    ],
  };
};
