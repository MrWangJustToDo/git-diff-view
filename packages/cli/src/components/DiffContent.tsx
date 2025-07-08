/* eslint-disable max-lines */
import { DiffLineType } from "@git-diff-view/core";
import { memoFunc, getSymbol, NewLineSymbol } from "@git-diff-view/utils";
import { Box, Text } from "ink";
import * as React from "react";

import { diffAddContentHighlight, diffDelContentHighlight, GitHubDark, GitHubLight } from "./color";
import { DiffNoNewLine } from "./DiffNoNewLine";

import type { DiffFile, DiffLine, File } from "@git-diff-view/core";

// for shiki highlighter
export const getStyleObjectFromString = memoFunc((str: string) => {
  const re = { light: {}, dark: {} };
  if (!str) return re;
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    if (!property) return;
    if (property.trim()?.endsWith("light")) {
      re["light"]["color"] = value.trim();
      return;
    }
    if (property.trim()?.endsWith("dark")) {
      re["dark"]["color"] = value.trim();
      return;
    }
  });
  return re;
});

// for lowlight highlighter
export const getStyleFromClassName = memoFunc((className: string) => {
  const re = { light: {}, dark: {} };
  if (!className) return re;
  className.split(" ").forEach((name) => {
    const dark = GitHubDark[name] || {};
    const light = GitHubLight[name] || {};
    Object.assign(re.dark, dark);
    Object.assign(re.light, light);
  });
  return re;
});

const DiffString = ({
  theme,
  rawLine,
  diffLine,
  operator,
}: {
  theme: "light" | "dark";
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  plainLine?: File["plainFile"][number];
}) => {
  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    const range = changes.range;
    const str1 = rawLine.slice(0, range.location);
    const str2 = rawLine.slice(range.location, range.location + range.length);
    const str3 = rawLine.slice(range.location + range.length);
    const isLast = str2.includes("\n");
    const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
    return (
      <Box>
        <Box data-range-start={range.location} data-range-end={range.location + range.length}>
          <Text>{str1}</Text>
          <Text
            data-diff-highlight
            backgroundColor={
              operator === "add"
                ? theme === "light"
                  ? diffAddContentHighlight.light
                  : diffAddContentHighlight.dark
                : theme === "light"
                  ? diffDelContentHighlight.light
                  : diffDelContentHighlight.dark
            }
          >
            {isLast ? (
              <>
                {_str2}
                <Text data-newline-symbol>{getSymbol(isNewLineSymbolChanged)}</Text>
              </>
            ) : (
              str2
            )}
          </Text>
          <Text>{str3}</Text>
        </Box>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && <DiffNoNewLine />}
      </Box>
    );
  }

  return (
    <Box>
      <Text>{rawLine}</Text>
    </Box>
  );
};

const DiffSyntax = ({
  theme,
  rawLine,
  diffLine,
  operator,
  syntaxLine,
}: {
  theme: "light" | "dark";
  rawLine: string;
  diffLine?: DiffLine;
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
}) => {
  if (!syntaxLine) {
    return <DiffString theme={theme} rawLine={rawLine} diffLine={diffLine} operator={operator} />;
  }

  const changes = diffLine?.changes;

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    const range = changes.range;

    return (
      <Box>
        <Box data-range-start={range.location} data-range-end={range.location + range.length}>
          {syntaxLine.nodeList?.map(({ node, wrapper }, index) => {
            const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
            const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
            const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
            const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
            if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
              return (
                <Text
                  key={index}
                  data-start={node.startIndex}
                  data-end={node.endIndex}
                  {...lowlightStyle}
                  {...shikiStyle}
                >
                  {node.value}
                </Text>
              );
            } else {
              const index1 = range.location - node.startIndex;
              const index2 = index1 < 0 ? 0 : index1;
              const str1 = node.value.slice(0, index2);
              const str2 = node.value.slice(index2, index1 + range.length);
              const str3 = node.value.slice(index1 + range.length);
              const isLast = str2.includes("\n");
              const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
              return (
                <Text
                  key={index}
                  data-start={node.startIndex}
                  data-end={node.endIndex}
                  {...lowlightStyle}
                  {...shikiStyle}
                >
                  <Text>{str1}</Text>
                  <Text
                    data-diff-highlight
                    backgroundColor={
                      operator === "add"
                        ? theme === "light"
                          ? diffAddContentHighlight.light
                          : diffAddContentHighlight.dark
                        : theme === "light"
                          ? diffDelContentHighlight.light
                          : diffDelContentHighlight.dark
                    }
                  >
                    {isLast ? (
                      <>
                        {_str2}
                        <Text data-newline-symbol>{getSymbol(isNewLineSymbolChanged)}</Text>
                      </>
                    ) : (
                      str2
                    )}
                  </Text>
                  <Text>{str3}</Text>
                </Text>
              );
            }
          })}
        </Box>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && <DiffNoNewLine />}
      </Box>
    );
  }

  return (
    <Box>
      {syntaxLine?.nodeList?.map(({ node, wrapper }, index) => {
        const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
        const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
        const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
        const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
        return (
          <Text key={index} data-start={node.startIndex} data-end={node.endIndex} {...lowlightStyle} {...shikiStyle}>
            {node.value}
          </Text>
        );
      })}
    </Box>
  );
};

export const DiffContent = ({
  theme,
  diffLine,
  rawLine,
  plainLine,
  syntaxLine,
  enableHighlight,
}: {
  rawLine: string;
  theme: "light" | "dark";
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableHighlight: boolean;
}) => {
  const isAdded = diffLine?.type === DiffLineType.Add;

  const isDelete = diffLine?.type === DiffLineType.Delete;

  const isMaxLineLengthToIgnoreSyntax = syntaxLine?.nodeList?.length > 150;

  return (
    <Box>
      <Text data-operator={isAdded ? "+" : isDelete ? "-" : undefined}>{isAdded ? "+" : isDelete ? "-" : " "}</Text>
      {enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? (
        <DiffSyntax
          theme={theme}
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      ) : (
        <DiffString
          theme={theme}
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          plainLine={plainLine}
        />
      )}
    </Box>
  );
};
