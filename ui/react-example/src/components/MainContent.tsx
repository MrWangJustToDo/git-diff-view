import { generateDiffFile } from "@git-diff-view/file";
import { DiffFile, DiffModeEnum, SplitSide } from "@git-diff-view/react";
import { highlighterReady } from "@git-diff-view/shiki";
import {
  Box,
  Button,
  Code,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Space,
  Stack,
  Text,
  Textarea as _Textarea,
  Title,
  Tooltip,
  useMantineColorScheme,
  Card,
  CloseButton,
  Highlight,
  useMantineTheme,
  alpha,
  getThemeColor,
  Container,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { startTransition, useEffect, useMemo, useState } from "react";

import { DiffViewWithScrollBar } from "./DiffViewWithScrollBar";
import { temp1, temp2 } from "./MainContentData";

import type { DiffViewProps, DiffHighlighter } from "@git-diff-view/react";

const _diffFile = generateDiffFile("temp1.tsx", temp1, "temp2.tsx", temp2);

_diffFile.initRaw();

_diffFile.buildSplitDiffLines();

const Textarea = ({ onChange }: { onChange: (v: string) => void }) => {
  const [val, setVal] = useState("");

  useEffect(() => {
    onChange(val);
  }, [val]);

  return <_Textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)} resize="vertical" />;
};

export const MainContent = () => {
  const theme = useMantineTheme();

  const { colorScheme } = useMantineColorScheme();

  const [str, setStr] = useState("");

  const color = useMemo(() => alpha(getThemeColor("yellow", theme), 0.5), [theme]);

  const [extend, setExtend] = useState<DiffViewProps<string[]>["extendData"]>({
    oldFile: {},
    newFile: {},
  });

  const [loading, setLoading] = useState(false);

  const refreshFile = () => {
    setLoading(true);
    const diffFile = DiffFile.createInstance({
      oldFile: { content: temp1, fileName: "temp1.tsx" },
      newFile: { content: temp2, fileName: "temp2.tsx" },
      hunks: _diffFile._diffList,
    });
    diffFile.initRaw();
    diffFile.buildSplitDiffLines();
    setDiffFile(diffFile);
    // simulate loading
    setTimeout(() => {
      startTransition(() => setLoading(false));
    }, 800);
  };

  const [diffFile, setDiffFile] = useState(() => _diffFile);

  const [highlighter, setHighlighter] = useState<Omit<DiffHighlighter, "getHighlighterEngine">>();

  const [mode, setMode] = useState(DiffModeEnum.Split);

  const [wrap, setWrap] = useState(false);

  const [highlight, setHighlight] = useState(true);

  const [engine, setEngine] = useState<"lowlight" | "shiki">("lowlight");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const shikiHighlighter = await highlighterReady;
        if (shikiHighlighter) {
          setHighlighter(shikiHighlighter);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <Container size="xl">
      <Flex mt="lg" direction={{ base: "column", sm: "row" }}>
        <Stack gap="2" className="flex-1" mb="20" ml={{ md: "2em", lg: "3em", xl: "4em" }} mr="lg">
          <Space h="40" />
          <Title>Git Diff View</Title>
          <Space h="12" />
          <Text size="lg" component="div">
            A <Code>Diff</Code> view component for React / Vue,
            <Highlight highlight={["easy to use", "feature complete"]} color={color}>
              The most one component what easy to use and feature complete.
            </Highlight>
          </Text>
          <Space h="12" />
          <Divider />
          <Space h="12" />
          <Title order={4}>Diff View Config</Title>
          <Space h="4" />
          <Group>
            <Tooltip label="diff view mode">
              <Button
                onClick={() => setMode((l) => (l === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split))}
              >
                {mode === DiffModeEnum.Split ? "split" : "unified"}
              </Button>
            </Tooltip>
            <Tooltip label="code line mode">
              <Button onClick={() => setWrap(!wrap)}>{wrap ? "wrap" : "no wrap"}</Button>
            </Tooltip>
            <Tooltip label="highlight status">
              <Button onClick={() => setHighlight(!highlight)}>highlight {highlight ? "enable" : "disable"}</Button>
            </Tooltip>
            <Tooltip label="highlight engine">
              <Button
                disabled={!highlight}
                onClick={() => {
                  setEngine((l) => (l === "lowlight" ? "shiki" : "lowlight"));
                  refreshFile();
                }}
              >
                {engine}
              </Button>
            </Tooltip>
          </Group>
        </Stack>

        <Box
          className={`relative h-[calc(100vh-200px)] transform-gpu overflow-hidden rounded-md border border-solid ${colorScheme === "light" ? "border-gray-200" : "border-gray-600"}`}
          w={{ base: "100%", sm: "60%" }}
        >
          <Tooltip label="refresh">
            <Button
              className="fixed right-6 top-2 z-10"
              variant="light"
              size="compact-sm"
              color="yellow"
              onClick={refreshFile}
            >
              <IconRefresh className="w-[1.2em]" />
            </Button>
          </Tooltip>
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
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
                            className="absolute right-2 top-2"
                            size="xs"
                            onClick={() => {
                              setExtend((prev) => {
                                const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                                const res = { ...prev };
                                res[sideKey] = {
                                  ...res[sideKey],
                                  [lineNumber]: {
                                    data: res[sideKey]?.[lineNumber].data.filter((_, index) => index !== i),
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
              // because of the cache, switch the highlighter engine will not work, need a new diffFile instance to avoid this
              // see packages/core/src/file.ts:172 getFile
              registerHighlighter={engine === "lowlight" ? undefined : highlighter}
              diffViewFontSize={12}
            />
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};
