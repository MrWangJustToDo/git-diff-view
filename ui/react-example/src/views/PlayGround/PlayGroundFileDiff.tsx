import { generateDiffFile } from "@git-diff-view/file";
import {
  getEnableFastDiffTemplate,
  setEnableFastDiffTemplate,
  DiffView,
  getMaxLengthToIgnoreLineDiff,
  changeMaxLengthToIgnoreLineDiff,
} from "@git-diff-view/react";
import {
  useMantineColorScheme,
  Button,
  NumberInput,
  Tooltip,
  Collapse,
  Container,
  Box,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  TextInput,
  Grid,
} from "@mantine/core";
import { useCallbackRef } from "@mantine/hooks";
import { IconFileDiff, IconSettings } from "@tabler/icons-react";
import { debounce } from "lodash";
import { useState, useCallback, useEffect } from "react";

import { CodeEditor } from "../../components/CodeEditor";

import type { DiffFile } from "@git-diff-view/react";

const defaultFile1 =
  'import { createLowlight, all } from "lowlight";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nconst lowlight = createLowlight(all);\n\n// !SEE https://github.com/highlightjs/highlightjs-vue\n\nlowlight.register("vue", function hljsDefineVue(hljs) {\n  return {\n    subLanguage: "xml",\n    contains: [\n      hljs.COMMENT("<!--", "-->", {\n        relevance: 10,\n      }),\n      {\n        begin: /^(\\s*)(<script>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "javascript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<script\\s+lang=(["\'])ts\\1>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "typescript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(\\s*)(<style(\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "css",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])(?:s[ca]ss)\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "scss",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])stylus\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "stylus",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n    ],\n  };\n});\n\nexport type DiffAST = ReturnType<typeof lowlight.highlight>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => ReturnType<typeof createLowlight> | null;\n};';

const defaultFile2 =
  'import { getHighlighter } from "shiki";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nimport type { codeToHast } from "shiki";\n\nexport type DiffAST = DePromise<ReturnType<typeof codeToHast>>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;\n};\n\nlet internal: DePromise<ReturnType<typeof getHighlighter>> | null = null;\n\nconst getDefaultHighlighter = async () =>\n  await getHighlighter({\n    themes: ["github-light", "github-dark"],\n    langs: [\n      "cpp",\n      "java",\n      "javascript",\n      "css",\n      "c#",\n      "c",\n      "c++",\n      "vue",\n      "vue-html",\n      "astro",\n      "bash",\n      "make",\n      "markdown",\n      "makefile",\n      "bat",\n      "cmake",\n      "cmd",\n      "csv",\n      "docker",\n      "dockerfile",\n      "go",\n      "python",\n      "html",\n      "jsx",\n      "tsx",\n      "typescript",\n      "sql",\n      "xml",\n      "sass",\n      "ssh-config",\n      "kotlin",\n      "json",\n      "swift",\n      "txt",\n      "diff",\n    ],\n  });\n\nconst instance = { name: "shiki" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});';

export const PlayGroundFileDiff = () => {
  const [lang1, setLang1] = useState("ts");

  const [lang2, setLang2] = useState("ts");

  const [ignoreWhiteSpace, setIgnoreWhiteSpace] = useState(false);

  const [rangeDiffInstance, setRangeDiffInstance] = useState<DiffFile>();

  const [rangeMode, setRangeMode] = useState(false);

  const [start, setStart] = useState(0);

  const [end, setEnd] = useState(0);

  const [fastDiffTemplate, setFastDiffTemplate] = useState(getEnableFastDiffTemplate());

  const [file1, setFile1] = useState(defaultFile1);

  const [file2, setFile2] = useState(defaultFile2);

  const [showConfig, setShowConfig] = useState(true);

  const { colorScheme } = useMantineColorScheme();

  const [diffInstance, setDiffInstance] = useState<DiffFile>();

  const setDiffInstanceCb = useCallback(
    debounce((lang1: string, lang2: string, file1: string, file2: string, ignoreWhiteSpace: boolean) => {
      setRangeMode(false);
      setStart(0);
      setEnd(0);
      setRangeDiffInstance(undefined);
      if (!file1 && !file2) {
        setDiffInstance(undefined);
        return;
      }
      const data = generateDiffFile(`foo.${lang1}`, file1, `foo.${lang2}`, file2, lang1, lang2, {
        ignoreWhitespace: ignoreWhiteSpace,
      });
      try {
        data?.init();
        data?.buildSplitDiffLines();
        setDiffInstance(data);
      } catch (e) {
        alert((e as Error).message);
      }
    }, 1000),
    []
  );

  const reloadDiffInstance = useCallbackRef(() => {
    setDiffInstanceCb(lang1, lang2, file1, file2, ignoreWhiteSpace);
  });

  useEffect(() => {
    setDiffInstanceCb(lang1, lang2, file1, file2, ignoreWhiteSpace);
  }, [file1, file2, lang1, lang2, ignoreWhiteSpace]);

  useEffect(() => {
    setEnableFastDiffTemplate(fastDiffTemplate);
    reloadDiffInstance();
  }, [fastDiffTemplate]);

  useEffect(() => {
    if (diffInstance && start && end) {
      setRangeDiffInstance(diffInstance.generateInstanceFromLineNumberRange(start, end));
    }
  }, [diffInstance, start, end]);

  const finalDiffInstance = rangeMode ? rangeDiffInstance : diffInstance;

  return (
    <Box className="min-h-screen">
      <Container size="xl" py="xl">
        {/* Header */}
        <Box className="mb-8 text-center">
          <Group justify="center" gap="xs" mb="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "teal", to: "green", deg: 90 }}
              leftSection={<IconFileDiff size={16} />}
            >
              Playground
            </Badge>
          </Group>

          <Title
            order={1}
            className="mb-4 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-teal-400 dark:to-green-400"
          >
            File Diff Playground
          </Title>

          <Text size="lg" c="dimmed" className="mx-auto max-w-2xl">
            Compare two files side by side and generate a diff view on the fly.
          </Text>
        </Box>

        {/* Config Panel */}
        <Box
          className="mb-6 rounded-xl border border-solid p-5 shadow-sm"
          style={{
            borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
            backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
          }}
        >
          <Group justify="space-between" mb="md">
            <Title order={4} className="text-lg">
              Configuration
            </Title>
            <Button
              variant="subtle"
              size="compact-sm"
              color="gray"
              onClick={() => setShowConfig(!showConfig)}
              leftSection={<IconSettings size={16} />}
            >
              {showConfig ? "Hide" : "Show"}
            </Button>
          </Group>

          <Collapse in={showConfig}>
            <Stack gap="md">
              <Group gap="sm">
                <Tooltip label="Ignore whitespace differences">
                  <Button
                    variant="light"
                    size="compact-sm"
                    color={ignoreWhiteSpace ? "blue" : "gray"}
                    onClick={() => setIgnoreWhiteSpace(!ignoreWhiteSpace)}
                  >
                    {ignoreWhiteSpace ? "Whitespace: Ignore" : "Whitespace: Compare"}
                  </Button>
                </Tooltip>
                <Tooltip label="Fast Diff Template (better line diff)">
                  <Button
                    variant="light"
                    size="compact-sm"
                    color={fastDiffTemplate ? "blue" : "gray"}
                    onClick={() => setFastDiffTemplate(!fastDiffTemplate)}
                  >
                    {fastDiffTemplate ? "Fast Diff: ON" : "Fast Diff: OFF"}
                  </Button>
                </Tooltip>
                <Tooltip label="Show only a portion of the diff">
                  <Button
                    variant="light"
                    size="compact-sm"
                    color={rangeMode ? "blue" : "gray"}
                    onClick={() => setRangeMode(!rangeMode)}
                  >
                    {rangeMode ? "Range: ON" : "Range: OFF"}
                  </Button>
                </Tooltip>
                <Tooltip label="Ignore line diff when line length over this value">
                  <NumberInput
                    size="xs"
                    value={getMaxLengthToIgnoreLineDiff()}
                    min={100}
                    max={6000}
                    w={120}
                    onChange={(n) => {
                      changeMaxLengthToIgnoreLineDiff(Number(n));
                      reloadDiffInstance();
                    }}
                  />
                </Tooltip>
              </Group>

              <Collapse in={rangeMode}>
                <Group gap="sm">
                  <NumberInput
                    size="xs"
                    value={start}
                    min={0}
                    label="Range Start"
                    max={diffInstance?.splitLineLength}
                    onChange={(n) => setStart(Number(n))}
                  />
                  <NumberInput
                    size="xs"
                    value={end}
                    min={0}
                    label="Range End"
                    max={diffInstance?.splitLineLength}
                    onChange={(n) => setEnd(Number(n))}
                  />
                </Group>
              </Collapse>
            </Stack>
          </Collapse>
        </Box>

        {/* Editor Panels */}
        <Grid gutter="md" className="mb-6">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box
              className="h-full rounded-xl border border-solid p-4 shadow-sm"
              style={{
                borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
                backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={500}>File 1</Text>
                <TextInput
                  size="xs"
                  placeholder="lang"
                  value={lang1}
                  onChange={(e) => setLang1(e.target.value)}
                  w={80}
                />
              </Group>
              <CodeEditor code={file1} onChange={setFile1} lang={lang1} minHeight="200px" />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box
              className="h-full rounded-xl border border-solid p-4 shadow-sm"
              style={{
                borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
                backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={500}>File 2</Text>
                <TextInput
                  size="xs"
                  placeholder="lang"
                  value={lang2}
                  onChange={(e) => setLang2(e.target.value)}
                  w={80}
                />
              </Group>
              <CodeEditor code={file2} onChange={setFile2} lang={lang2} minHeight="200px" />
            </Box>
          </Grid.Col>
        </Grid>

        {/* Diff Preview */}
        <Box
          className="overflow-hidden rounded-xl border-2 border-solid"
          style={{
            borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
            backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
          }}
        >
          <Group p="md" pb={0}>
            <IconFileDiff size={20} />
            <Title order={4}>Preview</Title>
          </Group>

          {finalDiffInstance ? (
            <Box p="md">
              <DiffView<string>
                className="overflow-hidden rounded-lg border border-solid"
                style={{
                  borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
                }}
                diffFile={finalDiffInstance}
                diffViewFontSize={13}
                diffViewTheme={colorScheme === "dark" ? "dark" : "light"}
                diffViewHighlight={true}
                diffViewWrap
              />
            </Box>
          ) : (
            <Box p="xl" className="text-center">
              <Text c="dimmed" size="lg">
                No diff to preview. Provide file contents above.
              </Text>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
