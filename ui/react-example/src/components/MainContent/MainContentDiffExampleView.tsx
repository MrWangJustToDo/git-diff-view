import { SplitSide, disableCache } from "@git-diff-view/react";
import { Box, Button, Card, CloseButton, Group, Stack, useMantineColorScheme, Text } from "@mantine/core";
import { usePrevious } from "@mantine/hooks";
import { memo, useEffect, useState } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";
import { DiffViewWithScrollBar } from "../DiffViewWithScrollBar";
import { Textarea } from "../TextArea";

import { defaultComment } from "./MainContentDiffExample";

import type { DiffFile, DiffViewProps } from "@git-diff-view/react";

// disable diffFile Cache
disableCache();

export const MainContentDiffExampleView = memo(
  ({
    diffFile,
    highlighter,
    refreshDiffFile,
  }: {
    diffFile: DiffFile;
    highlighter?: DiffViewProps<string[]>["registerHighlighter"];
    refreshDiffFile: () => void;
  }) => {
    const { colorScheme } = useMantineColorScheme();

    const [str, setStr] = useState("");

    const [extend, setExtend] = useState<DiffViewProps<string[]>["extendData"]>({
      oldFile: { 2: { data: ['console.log("hello world");'] } },
      newFile: {},
    });

    const { highlight, mode, wrap, engine, tabSpace, fastDiff, autoExpandCommentLine } = useDiffConfig();

    const prevEngine = usePrevious(engine);

    const prevTabSpace = usePrevious(tabSpace);

    const prevFastDiff = usePrevious(fastDiff);

    const prevAutoExpandCommentLine = usePrevious(autoExpandCommentLine);

    // because of the cache, switch the highlighter engine will not work, need a new diffFile instance to avoid this
    // see packages/core/src/file.ts:172 getFile
    // TODO fix this in the future
    useEffect(() => {
      if (prevEngine !== engine || tabSpace !== prevTabSpace || fastDiff !== prevFastDiff) {
        refreshDiffFile();
      }
    }, [engine, prevEngine, tabSpace, prevTabSpace, fastDiff, prevFastDiff, refreshDiffFile]);

    useEffect(() => {
      if (autoExpandCommentLine !== prevAutoExpandCommentLine) {
        if (autoExpandCommentLine) {
          setExtend(defaultComment);
          refreshDiffFile();
        } else {
          refreshDiffFile();
        }
      }
    }, [autoExpandCommentLine, prevAutoExpandCommentLine]);

    return (
      <Box className="h-full overflow-auto">
        <DiffViewWithScrollBar
          diffFile={diffFile}
          diffViewTheme={colorScheme === "light" ? "light" : "dark"}
          diffViewHighlight={highlight}
          diffViewMode={mode}
          diffViewWrap={wrap}
          diffViewAddWidget
          renderWidgetLine={({ side, lineNumber, onClose }) => {
            // render scope have a high level tailwind default style, next release should fix this
            return (
              <Box p="lg" className="widget border-color border-b border-t border-solid">
                <Textarea onChange={(v) => setStr(v)} />
                <Group mt="lg" justify="flex-end">
                  <Button onClick={onClose} color="gray" className="text-white" size="xs">
                    cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      if (str) {
                        const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                        setExtend((prev) => {
                          const res = { ...prev };
                          res[sideKey] = {
                            ...res[sideKey],
                            [lineNumber]: { data: [...(res[sideKey]?.[lineNumber]?.["data"] || []), str] },
                          };
                          return res;
                        });
                      }
                    }}
                    className="text-white"
                    size="xs"
                  >
                    submit
                  </Button>
                </Group>
              </Box>
            );
          }}
          extendData={extend}
          renderExtendLine={({ data, side, lineNumber }) => {
            if (!data || !data.length) return null;
            return (
              <Box className="border-color border-b border-t border-solid" p="sm">
                <Stack>
                  {data.map((d, i) => (
                    <Card key={i} withBorder className="relative">
                      <Text>{d}</Text>
                      <CloseButton
                        className="absolute right-1 top-1"
                        size="xs"
                        onClick={() => {
                          setExtend((prev) => {
                            const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                            const res = { ...prev };
                            const nData = res[sideKey]?.[lineNumber].data.filter((_, index) => index !== i);
                            res[sideKey] = {
                              ...res[sideKey],
                              [lineNumber]: {
                                data: nData?.length ? nData : undefined,
                              },
                            };
                            return res;
                          });
                        }}
                      />
                    </Card>
                  ))}
                </Stack>
              </Box>
            );
          }}
          registerHighlighter={engine === "lowlight" ? undefined : highlighter}
          diffViewFontSize={13}
        />
      </Box>
    );
  }
);

MainContentDiffExampleView.displayName = "MainContentDiffExampleView";
