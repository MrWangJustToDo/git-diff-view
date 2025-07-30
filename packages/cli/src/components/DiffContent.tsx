/* eslint-disable max-lines */
import { DiffLineType } from "@git-diff-view/core";
import { memoFunc, NewLineSymbol } from "@git-diff-view/utils";
import { Box, Text } from "ink";
import * as React from "react";

import {
  diffAddContent,
  diffAddContentHighlight,
  diffDelContent,
  diffDelContentHighlight,
  diffExpandContent,
  diffPlainContent,
  GitHubDark,
  GitHubLight,
} from "./color";
import { useDiffViewContext } from "./DiffViewContext";

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
  bg,
  width,
  theme,
  rawLine,
  diffLine,
  operator,
}: {
  bg: string;
  width: number;
  theme: "light" | "dark";
  height: number;
  rawLine: string;
  diffLine?: DiffLine;
  operator?: "add" | "del";
  plainLine?: File["plainFile"][number];
}) => {
  const changes = diffLine?.changes;

  const { useDiffContext } = useDiffViewContext();

  const { enableTabSpace, tabWidth } = useDiffContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    const range = changes.range;
    const str1 = rawLine.slice(0, range.location);
    const str2 = rawLine.slice(range.location, range.location + range.length);
    const str3 = rawLine.slice(range.location + range.length);

    const highlightBG =
      operator === "add"
        ? theme === "light"
          ? diffAddContentHighlight.light
          : diffAddContentHighlight.dark
        : theme === "light"
          ? diffDelContentHighlight.light
          : diffDelContentHighlight.dark;

    return (
      <>
        <Box
          width={width - 1}
          data-range-start={range.location}
          data-range-end={range.location + range.length}
          flexWrap="wrap"
          backgroundColor={bg}
        >
          {str1.split("").map((char, index) => {
            if (enableTabSpace && char === " ") {
              return (
                <Text key={index} dimColor>
                  ·
                </Text>
              );
            }
            if (char === "\t") {
              if (enableTabSpace) {
                return (
                  <React.Fragment key={index}>
                    {"→"
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex} dimColor={spaceIndex === 0}>
                          {spaceChar}
                        </Text>
                      ))}
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={index}>
                    {""
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex}>{spaceChar}</Text>
                      ))}
                  </React.Fragment>
                );
              }
            }
            return <Text key={index}>{char}</Text>;
          })}
          {str2.split("").map((char, index) => {
            if (enableTabSpace && char === " ") {
              return (
                <Text key={index} backgroundColor={highlightBG} dimColor>
                  ·
                </Text>
              );
            }
            if (char === "\t") {
              if (enableTabSpace) {
                return (
                  <React.Fragment key={index}>
                    {"→"
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex} backgroundColor={highlightBG} dimColor={spaceIndex === 0}>
                          {spaceChar}
                        </Text>
                      ))}
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={index}>
                    {""
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex} backgroundColor={highlightBG}>
                          {spaceChar}
                        </Text>
                      ))}
                  </React.Fragment>
                );
              }
            }
            return (
              <Text key={index} backgroundColor={highlightBG}>
                {char}
              </Text>
            );
          })}
          {str3.split("").map((char, index) => {
            if (enableTabSpace && char === " ") {
              return (
                <Text key={index} dimColor>
                  ·
                </Text>
              );
            }
            if (char === "\t") {
              if (enableTabSpace) {
                return (
                  <React.Fragment key={index}>
                    {"→"
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex} dimColor={spaceIndex === 0}>
                          {spaceChar}
                        </Text>
                      ))}
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={index}>
                    {""
                      .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                      .split("")
                      .map((spaceChar, spaceIndex) => (
                        <Text key={spaceIndex}>{spaceChar}</Text>
                      ))}
                  </React.Fragment>
                );
              }
            }
            return <Text key={index}>{char}</Text>;
          })}
        </Box>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
          <Box width={width - 1} backgroundColor={bg}>
            <Text wrap="truncate">{"\\ No newline at end of file".padEnd(width)}</Text>
          </Box>
        )}
      </>
    );
  }

  return (
    <Box width={width - 1} flexWrap="wrap" backgroundColor={bg}>
      {rawLine.split("").map((char, index) => {
        if (enableTabSpace && char === " ") {
          return (
            <Text key={index} dimColor>
              ·
            </Text>
          );
        }
        if (char === "\t") {
          if (enableTabSpace) {
            return (
              <React.Fragment key={index}>
                {"→"
                  .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                  .split("")
                  .map((spaceChar, spaceIndex) => (
                    <Text key={spaceIndex} dimColor={spaceIndex === 0}>
                      {spaceChar}
                    </Text>
                  ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                {""
                  .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                  .split("")
                  .map((spaceChar, spaceIndex) => (
                    <Text key={spaceIndex}>{spaceChar}</Text>
                  ))}
              </React.Fragment>
            );
          }
        }
        return <Text key={index}>{char}</Text>;
      })}
    </Box>
  );
};

const DiffSyntax = ({
  bg,
  width,
  theme,
  height,
  rawLine,
  diffLine,
  operator,
  syntaxLine,
}: {
  bg: string;
  width: number;
  theme: "light" | "dark";
  height: number;
  rawLine: string;
  diffLine?: DiffLine;
  syntaxLine?: File["syntaxFile"][number];
  operator?: "add" | "del";
}) => {
  if (!syntaxLine) {
    return (
      <DiffString
        bg={bg}
        width={width}
        theme={theme}
        height={height}
        rawLine={rawLine}
        diffLine={diffLine}
        operator={operator}
      />
    );
  }

  const changes = diffLine?.changes;

  const { useDiffContext } = useDiffViewContext();

  const { enableTabSpace, tabWidth } = useDiffContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

  if (changes?.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;

    const range = changes.range;

    return (
      <>
        <Box
          width={width - 1}
          data-range-start={range.location}
          data-range-end={range.location + range.length}
          flexWrap="wrap"
          backgroundColor={bg}
        >
          {syntaxLine.nodeList?.map(({ node, wrapper }, index) => {
            const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
            const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
            const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
            const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
            if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
              return (
                <React.Fragment key={index}>
                  {node.value.split("").map((char, index) => {
                    if (enableTabSpace && char === " ") {
                      return (
                        <Text key={index} dimColor {...lowlightStyle} {...shikiStyle}>
                          ·
                        </Text>
                      );
                    }
                    if (char === "\t") {
                      if (enableTabSpace) {
                        return (
                          <React.Fragment key={index}>
                            {"→"
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} dimColor={spaceIndex === 0} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment key={index}>
                            {""
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      }
                    }
                    return (
                      <Text key={index} {...lowlightStyle} {...shikiStyle}>
                        {char}
                      </Text>
                    );
                  })}
                </React.Fragment>
              );
            } else {
              const index1 = range.location - node.startIndex;
              const index2 = index1 < 0 ? 0 : index1;
              const str1 = node.value.slice(0, index2);
              const str2 = node.value.slice(index2, index1 + range.length);
              const str3 = node.value.slice(index1 + range.length);
              const highlightBG =
                operator === "add"
                  ? theme === "light"
                    ? diffAddContentHighlight.light
                    : diffAddContentHighlight.dark
                  : theme === "light"
                    ? diffDelContentHighlight.light
                    : diffDelContentHighlight.dark;
              return (
                <React.Fragment key={index}>
                  {str1.split("").map((char, index) => {
                    if (enableTabSpace && char === " ") {
                      return (
                        <Text key={index} dimColor {...lowlightStyle} {...shikiStyle}>
                          ·
                        </Text>
                      );
                    }
                    if (char === "\t") {
                      if (enableTabSpace) {
                        return (
                          <React.Fragment key={index}>
                            {"→"
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} dimColor={spaceIndex === 0} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment key={index}>
                            {""
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      }
                    }
                    return (
                      <Text key={index} {...lowlightStyle} {...shikiStyle}>
                        {char}
                      </Text>
                    );
                  })}
                  {str2.split("").map((char, index) => {
                    if (enableTabSpace && char === " ") {
                      return (
                        <Text key={index} backgroundColor={highlightBG} dimColor {...lowlightStyle} {...shikiStyle}>
                          ·
                        </Text>
                      );
                    }
                    if (char === "\t") {
                      if (enableTabSpace) {
                        return (
                          <React.Fragment key={index}>
                            {"→"
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text
                                  key={spaceIndex}
                                  backgroundColor={highlightBG}
                                  dimColor={spaceIndex === 0}
                                  {...lowlightStyle}
                                  {...shikiStyle}
                                >
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment key={index}>
                            {""
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} backgroundColor={highlightBG} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      }
                    }
                    return (
                      <Text key={index} backgroundColor={highlightBG} {...lowlightStyle} {...shikiStyle}>
                        {char}
                      </Text>
                    );
                  })}
                  {str3.split("").map((char, index) => {
                    if (enableTabSpace && char === " ") {
                      return (
                        <Text key={index} dimColor {...lowlightStyle} {...shikiStyle}>
                          ·
                        </Text>
                      );
                    }
                    if (char === "\t") {
                      if (enableTabSpace) {
                        return (
                          <React.Fragment key={index}>
                            {"→"
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} dimColor={spaceIndex === 0} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment key={index}>
                            {""
                              .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                              .split("")
                              .map((spaceChar, spaceIndex) => (
                                <Text key={spaceIndex} {...lowlightStyle} {...shikiStyle}>
                                  {spaceChar}
                                </Text>
                              ))}
                          </React.Fragment>
                        );
                      }
                    }
                    return (
                      <Text key={index} {...lowlightStyle} {...shikiStyle}>
                        {char}
                      </Text>
                    );
                  })}
                </React.Fragment>
              );
            }
          })}
        </Box>
        {isNewLineSymbolChanged === NewLineSymbol.NEWLINE && (
          <Box width={width - 1} backgroundColor={bg}>
            <Text wrap="truncate">{"\\ No newline at end of file".padEnd(width)}</Text>
          </Box>
        )}
      </>
    );
  }

  return (
    <Box width={width - 1} flexWrap="wrap" backgroundColor={bg}>
      {syntaxLine?.nodeList?.map(({ node, wrapper }, index) => {
        const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
        const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
        const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
        const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
        return (
          <React.Fragment key={index}>
            {node.value.split("").map((char, index) => {
              if (enableTabSpace && char === " ") {
                return (
                  <Text key={index} dimColor {...lowlightStyle} {...shikiStyle}>
                    ·
                  </Text>
                );
              }
              if (char === "\t") {
                if (enableTabSpace) {
                  return (
                    <React.Fragment key={index}>
                      {"→"
                        .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                        .split("")
                        .map((spaceChar, spaceIndex) => (
                          <Text key={spaceIndex} dimColor={spaceIndex === 0} {...lowlightStyle} {...shikiStyle}>
                            {spaceChar}
                          </Text>
                        ))}
                    </React.Fragment>
                  );
                } else {
                  return (
                    <React.Fragment key={index}>
                      {""
                        .padEnd(tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4, " ")
                        .split("")
                        .map((spaceChar, spaceIndex) => (
                          <Text key={spaceIndex} {...lowlightStyle} {...shikiStyle}>
                            {spaceChar}
                          </Text>
                        ))}
                    </React.Fragment>
                  );
                }
              }
              return (
                <Text key={index} {...lowlightStyle} {...shikiStyle}>
                  {char}
                </Text>
              );
            })}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export const DiffContent = ({
  theme,
  width,
  height,
  diffLine,
  rawLine,
  plainLine,
  syntaxLine,
  enableHighlight,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  rawLine: string;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableHighlight: boolean;
}) => {
  const isAdded = diffLine?.type === DiffLineType.Add;

  const isDelete = diffLine?.type === DiffLineType.Delete;

  const isMaxLineLengthToIgnoreSyntax = syntaxLine?.nodeList?.length > 150;

  const addBG = theme === "light" ? diffAddContent.light : diffAddContent.dark;
  const delBG = theme === "light" ? diffDelContent.light : diffDelContent.dark;
  const normalBG =
    theme === "light"
      ? diffLine
        ? diffPlainContent.light
        : diffExpandContent.light
      : diffLine
        ? diffPlainContent.dark
        : diffExpandContent.dark;

  return (
    <Box height={height}>
      <Box width={1}>
        <Text
          backgroundColor={isAdded ? addBG : isDelete ? delBG : normalBG}
          data-operator={isAdded ? "+" : isDelete ? "-" : undefined}
          wrap="wrap"
        >
          {(isAdded ? "+" : isDelete ? "-" : " ").padEnd(height)}
        </Text>
      </Box>
      {enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? (
        <DiffSyntax
          bg={isAdded ? addBG : isDelete ? delBG : normalBG}
          theme={theme}
          width={width}
          height={height}
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      ) : (
        <DiffString
          bg={isAdded ? addBG : isDelete ? delBG : normalBG}
          theme={theme}
          width={width}
          height={height}
          operator={isAdded ? "add" : isDelete ? "del" : undefined}
          rawLine={rawLine}
          diffLine={diffLine}
          plainLine={plainLine}
        />
      )}
    </Box>
  );
};
