import { DiffModeEnum, DiffViewWithMultiSelect as DiffViewMultiSelect, SplitSide } from "@git-diff-view/react";
import { Box, Button, Card, CloseButton, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { Fragment, memo, useCallback, useRef, useState } from "react";

import { Textarea } from "./TextArea";

import type { DiffFile, DiffViewWithMultiSelectProps, DiffViewWithMultiSelectRef } from "@git-diff-view/react";

interface ExtendDataItem {
  data: Array<{
    text: string;
    fromLine?: number;
    toLine?: number;
  }>;
}

type ExtendData = {
  oldFile?: Record<string, ExtendDataItem>;
  newFile?: Record<string, ExtendDataItem>;
};

interface WidgetState {
  lineNumber: number;
  fromLineNumber: number;
  side: SplitSide;
}

export const DiffViewWithMultiSelect = memo(
  ({
    diffFile,
    highlighter,
  }: {
    diffFile: DiffFile;
    highlighter?: DiffViewWithMultiSelectProps<string[]>["registerHighlighter"];
  }) => {
    const { colorScheme } = useMantineColorScheme();
    const diffViewRef = useRef<DiffViewWithMultiSelectRef>(null);
    const [diffViewMode, setDiffViewMode] = useState(DiffModeEnum.Split);
    const [diffViewWrap, setDiffViewWrap] = useState(false);

    const [extend, setExtend] = useState<ExtendData>({
      oldFile: {},
      newFile: {},
    });

    const [widgetState, setWidgetState] = useState<WidgetState | null>(null);
    const [commentText, setCommentText] = useState("");

    const handleAddWidgetClick = useCallback(
      ({ lineNumber, fromLineNumber, side }: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => {
        setWidgetState({
          lineNumber,
          fromLineNumber: fromLineNumber ?? lineNumber,
          side,
        });
      },
      []
    );

    const handleSubmitComment = useCallback(() => {
      if (!widgetState || !commentText.trim()) {
        setWidgetState(null);
        setCommentText("");
        diffViewRef.current?.clearSelection();
        return;
      }

      const { lineNumber, fromLineNumber, side } = widgetState;
      const sideKey = side === SplitSide.old ? "oldFile" : "newFile";

      setExtend((prev) => {
        const res = { ...prev };
        res[sideKey] = {
          ...res[sideKey],
          [lineNumber]: {
            data: [
              ...(res[sideKey]?.[lineNumber]?.data || []),
              { text: commentText.trim(), fromLine: fromLineNumber, toLine: lineNumber },
            ],
          },
        };
        return res;
      });

      setCommentText("");
      setWidgetState(null);
      diffViewRef.current?.clearSelection();
    }, [widgetState, commentText]);

    const handleCancelComment = useCallback(() => {
      setCommentText("");
      setWidgetState(null);
      diffViewRef.current?.clearSelection();
    }, []);

    const renderWidgetLine = useCallback(
      ({
        lineNumber,
        fromLineNumber,
        onClose,
      }: {
        lineNumber: number;
        fromLineNumber: number;
        side: SplitSide;
        diffFile: DiffFile;
        onClose: () => void;
      }) => {
        if (!widgetState) return null;

        return (
          <Box className="border-color border-b border-t border-solid" p="sm">
            <Stack>
              <Text size="sm" fw={500}>
                {fromLineNumber === lineNumber
                  ? `Add comment on line ${lineNumber}`
                  : `Add comment on lines ${fromLineNumber} - ${lineNumber}`}
              </Text>

              <Textarea onChange={setCommentText} />

              <Group justify="flex-end">
                <Button
                  variant="light"
                  color="gray"
                  size="xs"
                  onClick={() => {
                    handleCancelComment();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button size="xs" onClick={handleSubmitComment} disabled={!commentText.trim()}>
                  Submit
                </Button>
              </Group>
            </Stack>
          </Box>
        );
      },
      [widgetState, commentText, handleCancelComment, handleSubmitComment]
    );

    const renderExtendLine = useCallback(
      ({
        data,
        lineNumber,
        side,
      }: {
        data: Array<{
          text: string;
          fromLine?: number;
          toLine?: number;
        }>;
        side: SplitSide;
        lineNumber: number;
        diffFile: DiffFile;
        onUpdate: () => void;
      }) => {
        if (!data || !data.length) return null;

        const sideKey = side === SplitSide.old ? "oldFile" : "newFile";

        return (
          <Box className="border-color border-b border-t border-solid" p="sm">
            <Stack>
              {data.map((d, i) => (
                <Fragment>
                  <Text size="xs" c="dimmed">
                    Lines {d.fromLine} - {d.toLine}
                  </Text>
                  <Card key={i} withBorder className="relative">
                    <Text>{d.text}</Text>
                    <CloseButton
                      className="absolute right-1 top-1"
                      size="xs"
                      onClick={() => {
                        setExtend((prev) => {
                          const res = { ...prev };
                          const nData = res[sideKey]?.[lineNumber]?.data?.filter((_, index) => index !== i);
                          if (nData?.length) {
                            res[sideKey] = {
                              ...res[sideKey],
                              [lineNumber]: {
                                ...res[sideKey]?.[lineNumber],
                                data: nData,
                              },
                            };
                          } else {
                            const newSideData = { ...res[sideKey] };
                            delete newSideData[lineNumber];
                            res[sideKey] = newSideData;
                          }
                          return res;
                        });
                      }}
                    />
                  </Card>
                </Fragment>
              ))}
            </Stack>
          </Box>
        );
      },
      []
    );

    return (
      <>
        <Group mb="md" justify="flex-start" className="p-1">
          <Button
            size="xs"
            variant={diffViewMode & DiffModeEnum.Split ? "filled" : "light"}
            onClick={() => setDiffViewMode(DiffModeEnum.SplitGitHub)}
          >
            Split View
          </Button>
          <Button
            size="xs"
            variant={!(diffViewMode & DiffModeEnum.Split) ? "filled" : "light"}
            onClick={() => setDiffViewMode(DiffModeEnum.Unified)}
          >
            Unified View
          </Button>
          <Button size="xs" onClick={() => setDiffViewWrap((l) => !l)}>
            {diffViewWrap ? "Wrap" : "No Wrap"}
          </Button>
          <Text size="sm" c="dimmed" ml="md">
            Drag on line numbers to select multiple lines for commenting
          </Text>
        </Group>

        <Box
          className="h-full overflow-auto border-y"
          style={{
            borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
          }}
        >
          <DiffViewMultiSelect
            ref={diffViewRef}
            diffFile={diffFile}
            diffViewTheme={colorScheme === "light" ? "light" : "dark"}
            diffViewHighlight
            diffViewMode={diffViewMode}
            diffViewWrap={diffViewWrap}
            diffViewAddWidget={true}
            enableMultiSelect={true}
            extendData={extend}
            onAddWidgetClick={handleAddWidgetClick}
            renderWidgetLine={renderWidgetLine}
            renderExtendLine={renderExtendLine}
            registerHighlighter={highlighter}
            diffViewFontSize={13}
          />
        </Box>
      </>
    );
  }
);

DiffViewWithMultiSelect.displayName = "DiffViewWithMultiSelect";
