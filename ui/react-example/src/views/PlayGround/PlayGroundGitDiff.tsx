import {
  DiffFile,
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
} from "@mantine/core";
import { useCallbackRef } from "@mantine/hooks";
import { IconGitCompare, IconSettings } from "@tabler/icons-react";
import { debounce } from "lodash";
import { useState, useCallback, useEffect } from "react";

import { CodeEditor } from "../../components/CodeEditor";

const temp =
  'diff --git a/packages/myreact-reactivity/src/reactive/feature.ts b/packages/myreact-reactivity/src/reactive/feature.ts\nindex 5b301628..15aac42f 100644\n--- a/packages/myreact-reactivity/src/reactive/feature.ts\n+++ b/packages/myreact-reactivity/src/reactive/feature.ts\n@@ -74,7 +74,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n \n     componentWillUnmount(): void {\n       this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n     shouldComponentUpdate(): boolean {\n@@ -84,7 +84,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n       return true;\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -92,7 +92,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.effect.run() });\n+      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n     }\n   }\n \n@@ -104,10 +104,10 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     } & P\n   > {\n     componentWillUnmount(): void {\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -115,7 +115,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return this.effect.run();\n+      return this.reactiveEffect.run();\n     }\n   }\n';

const rawTemp =
  'import { Component, createElement, useState, useCallback, useMemo } from "@my-react/react";\n\nimport { proxyRefs, ReactiveEffect } from "../api";\n\nimport type { UnwrapRef } from "../api";\nimport type { LikeReactNode } from "@my-react/react";\n\ntype LifeCycle = {\n  onBeforeMount: Array<() => void>;\n\n  onMounted: Array<() => void>;\n\n  onBeforeUpdate: Array<() => void>;\n\n  onUpdated: Array<() => void>;\n\n  onBeforeUnmount: Array<() => void>;\n\n  onUnmounted: Array<() => void>;\n\n  hasHookInstalled: boolean;\n\n  canUpdateComponent: boolean;\n};\n\n/**\n * @internal\n */\nexport let globalInstance: LifeCycle | null = null;\n\nexport function createReactive<P extends Record<string, unknown>, S extends Record<string, unknown>>(props?: {\n  setup: () => S;\n  render?: (props: UnwrapRef<S> & P) => LikeReactNode;\n}) {\n  const setup = typeof props === "function" ? props : props.setup;\n\n  const render = typeof props === "function" ? null : props.render;\n\n  class ForBeforeUnmount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onBeforeUnmount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class ForBeforeMount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onBeforeMount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class RenderWithLifeCycle extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__instance__$$"]: LifeCycle;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onMounted.forEach((f) => f());\n    }\n\n    componentDidUpdate(): void {\n      this.props.$$__instance__$$.onUpdated.forEach((f) => f());\n    }\n\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n      this.reactiveEffect.stop();\n    }\n\n    shouldComponentUpdate(): boolean {\n      this.props.$$__instance__$$.canUpdateComponent = false;\n      this.props.$$__instance__$$.onBeforeUpdate.forEach((f) => f());\n      this.props.$$__instance__$$.canUpdateComponent = true;\n      return true;\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n    }\n  }\n\n  class Render extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentWillUnmount(): void {\n      this.reactiveEffect.stop();\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return this.reactiveEffect.run();\n    }\n  }\n\n  const MyReactReactiveComponent = (props: P & { children?: (props: UnwrapRef<S> & P) => LikeReactNode }) => {\n    const [instance] = useState(() => ({\n      onBeforeMount: [],\n      onBeforeUpdate: [],\n      onBeforeUnmount: [],\n      onMounted: [],\n      onUpdated: [],\n      onUnmounted: [],\n      hasHookInstalled: false,\n      canUpdateComponent: true,\n    }));\n\n    const state = useMemo(() => {\n      globalInstance = instance;\n\n      const state = proxyRefs(setup());\n\n      globalInstance = null;\n\n      return state;\n    }, []);\n\n    if (__DEV__) {\n      for (const key in props) {\n        if (key in state) {\n          console.warn(`duplicate key ${key} in Component props and reactive state, please fix this usage`);\n        }\n      }\n      if (props["children"] && typeof props["children"] !== "function") {\n        throw new Error("the component which return from createReactive() expect a function children");\n      }\n    }\n\n    const [, setState] = useState(() => 0);\n\n    const updateCallback = useCallback(() => {\n      if (instance.canUpdateComponent) {\n        setState((i) => i + 1);\n      }\n    }, []);\n\n    if (instance.hasHookInstalled) {\n      return createElement(ForBeforeUnmount, {\n        ["$$__instance__$$"]: instance,\n        children: createElement(RenderWithLifeCycle, {\n          ...props,\n          ["$$__trigger__$$"]: updateCallback,\n          ["$$__reactiveState__$$"]: state,\n          ["$$__instance__$$"]: instance,\n        }),\n      }) as LikeReactNode;\n    } else {\n      return createElement(Render, { ...props, ["$$__trigger__$$"]: updateCallback, ["$$__reactiveState__$$"]: state }) as LikeReactNode;\n    }\n  };\n\n  return MyReactReactiveComponent;\n}\n';

export const PlayGroundGitDiff = () => {
  const [lang, setLang] = useState("ts");

  const { colorScheme } = useMantineColorScheme();

  const [diffInstance, setDiffInstance] = useState<DiffFile>();

  const [rangeDiffInstance, setRangeDiffInstance] = useState<DiffFile>();

  const [rangeMode, setRangeMode] = useState(false);

  const [start, setStart] = useState(0);

  const [end, setEnd] = useState(0);

  const [fastDiffTemplate, setFastDiffTemplate] = useState(getEnableFastDiffTemplate());

  const [diffString, setDiffString] = useState(temp);

  const [content, setContent] = useState(rawTemp);

  const [showConfig, setShowConfig] = useState(true);

  const setDiffInstanceCb = useCallback(
    debounce((lang: string, diffString: string, content: string) => {
      setRangeMode(false);
      setStart(0);
      setEnd(0);
      setRangeDiffInstance(undefined);
      if (!diffString) {
        setDiffInstance(undefined);
        return;
      }
      const data = DiffFile.createInstance({
        newFile: { fileName: "new", fileLang: lang, content: content },
        hunks: [diffString],
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
    setDiffInstanceCb(lang, diffString, content);
  });

  useEffect(() => {
    setDiffInstanceCb(lang, diffString, content);
  }, [diffString, content, lang]);

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
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              leftSection={<IconGitCompare size={16} />}
            >
              Playground
            </Badge>
          </Group>

          <Title
            order={1}
            className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-blue-400 dark:to-cyan-400"
          >
            Git Diff Playground
          </Title>

          <Text size="lg" c="dimmed" className="mx-auto max-w-2xl">
            Paste raw git diff output and original file content to preview the diff with syntax highlighting.
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

              <TextInput
                size="sm"
                label="Syntax Language"
                placeholder="input syntax lang"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                w={200}
              />
            </Stack>
          </Collapse>
        </Box>

        {/* Editor Panels */}
        <Stack gap="md" className="mb-6">
          <Box
            className="rounded-xl border border-solid p-4 shadow-sm"
            style={{
              borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
              backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
            }}
          >
            <Text fw={500} mb="sm">
              Git Diff
            </Text>
            <CodeEditor code={diffString} onChange={setDiffString} lang="diff" minHeight="200px" />
          </Box>

          <Box
            className="rounded-xl border border-solid p-4 shadow-sm"
            style={{
              borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
              backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
            }}
          >
            <Text fw={500} mb="sm">
              Original File Content (optional)
            </Text>
            <CodeEditor code={content} onChange={setContent} lang={lang} minHeight="200px" />
          </Box>
        </Stack>

        {/* Diff Preview */}
        <Box
          className="overflow-hidden rounded-xl border-2 border-solid"
          style={{
            borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
            backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
          }}
        >
          <Group p="md" pb={0}>
            <IconGitCompare size={20} />
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
                diffViewTheme={colorScheme === "dark" ? "dark" : "light"}
                diffViewFontSize={13}
                diffViewHighlight={true}
                diffViewWrap
              />
            </Box>
          ) : (
            <Box p="xl" className="text-center">
              <Text c="dimmed" size="lg">
                No diff to preview. Paste git diff content above.
              </Text>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
