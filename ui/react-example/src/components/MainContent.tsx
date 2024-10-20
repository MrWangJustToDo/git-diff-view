import { generateDiffFile } from "@git-diff-view/file";
import { DiffFile, SplitSide } from "@git-diff-view/react";
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
  FloatingIndicator,
  ButtonGroup,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandReact, IconBrandVue, IconCode, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { useDiffConfig } from "../hooks/useDiffConfig";
import { useDiffHighlighter } from "../hooks/useDiffHighlighter";

import { DiffViewWithScrollBar } from "./DiffViewWithScrollBar";
import { MainContentCode } from "./MainContentCode";
import { temp1, temp2 } from "./MainContentData";
import { MainContentDiffConfig } from "./MainContentDiffConfig";

import type { DiffViewProps } from "@git-diff-view/react";

const _diffFile = generateDiffFile("temp1.tsx", temp1, "temp2.tsx", temp2);

const getNewDiffFile = () => {
  const instance = DiffFile.createInstance({
    oldFile: { content: temp1, fileName: "temp1.tsx" },
    newFile: { content: temp2, fileName: "temp2.tsx" },
    hunks: _diffFile._diffList,
  });
  instance.initRaw();
  return instance;
};

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

  const [code, { open, close }] = useDisclosure();

  const [platform, setPlatform] = useState<"react" | "vue">("react");

  const [str, setStr] = useState("");

  const color = useMemo(() => alpha(getThemeColor("yellow", theme), 0.5), [theme]);

  const [extend, setExtend] = useState<DiffViewProps<string[]>["extendData"]>({
    oldFile: {},
    newFile: {},
  });

  const [loading, setLoading] = useState(false);

  const refreshFile = () => {
    setLoading(true);
    setDiffFile(getNewDiffFile());
    // simulate loading
    setTimeout(() => {
      startTransition(() => setLoading(false));
    }, 800);
  };

  const [diffFile, setDiffFile] = useState(() => getNewDiffFile());

  const highlighter = useDiffHighlighter({ setLoading });

  const { mode, highlight, engine, wrap } = useDiffConfig();

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);

  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});

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
          <MainContentDiffConfig refreshFile={refreshFile} />
        </Stack>

        <Box
          className={`relative h-[calc(100vh-200px)] transform-gpu overflow-hidden rounded-md border border-solid ${colorScheme === "light" ? "border-gray-200" : "border-gray-600"}`}
          w={{ base: "100%", sm: "60%" }}
        >
          <Group className="fixed right-6 top-2 z-10">
            <div ref={setRootRef}>
              <ButtonGroup>
                <Tooltip label="show the code">
                  <Button
                    variant="light"
                    size="compact-sm"
                    onClick={open}
                    color="gray"
                    ref={useCallback((node: HTMLButtonElement) => setControlsRefs((l) => ({ ...l, code: node })), [])}
                  >
                    <IconCode className="w-[1.2em]" />
                  </Button>
                </Tooltip>
                <Tooltip label="show the preview">
                  <Button
                    variant="light"
                    size="compact-sm"
                    onClick={close}
                    color="gray"
                    ref={useCallback(
                      (node: HTMLButtonElement) => setControlsRefs((l) => ({ ...l, preview: node })),
                      []
                    )}
                  >
                    <IconPlayerPlay className="w-[1.2em]" />
                  </Button>
                </Tooltip>
              </ButtonGroup>

              <FloatingIndicator
                target={controlsRefs[code ? "code" : "preview"]}
                parent={rootRef}
                className="rounded-[var(--mantine-radius-default)] bg-[var(--mantine-color-violet-light)]"
              />
            </div>

            {!code ? (
              <Tooltip label="refresh">
                <Button variant="light" size="compact-sm" onClick={refreshFile}>
                  <IconRefresh className="w-[1.2em]" />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip label="switch the platform">
                <Button
                  variant="light"
                  size="compact-sm"
                  onClick={() => setPlatform(platform === "react" ? "vue" : "react")}
                >
                  {platform === "react" ? (
                    <IconBrandReact className="w-[1.2em]" />
                  ) : (
                    <IconBrandVue className="w-[1.2em]" />
                  )}
                </Button>
              </Tooltip>
            )}
          </Group>

          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          {code ? (
            <MainContentCode type={platform} />
          ) : (
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
                // TODO fix this in the future
                registerHighlighter={engine === "lowlight" ? undefined : highlighter}
                diffViewFontSize={12}
              />
            </Box>
          )}
        </Box>
      </Flex>
    </Container>
  );
};
