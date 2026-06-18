import { SandpackCodeEditor, SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react";
import { DiffFile } from "@git-diff-view/react";
import {
  Box,
  Button,
  Code,
  LoadingOverlay,
  Container,
  Title,
  Text,
  Badge,
  Group,
  Space,
  Accordion,
  useMantineColorScheme,
} from "@mantine/core";
import { IconCpu, IconCode, IconMessageCircle, IconPlayerPlay } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { DiffViewWithScrollBar } from "../../components/DiffViewWithScrollBar";

import { patch, newFileContent } from "./data";

import type { MessageData } from "../../worker";

const diffFileWorker = new Worker(new URL("../../worker.ts", import.meta.url), {
  type: "module",
});

const usageCode = `import { DiffFile } from "@git-diff-view/react";
import { DiffViewWithScrollBar } from "./DiffViewWithScrollBar";

// 1. Create a Web Worker for off-main-thread diff parsing
const diffFileWorker = new Worker(
  new URL("./worker.ts", import.meta.url),
  { type: "module" }
);

// 2. Worker message handler type
interface MessageData {
  id: number;
  data?: Record<string, any>;
  bundle?: ReturnType<DiffFile["getBundle"]>;
  error?: string;
}

function WorkerDiffView() {
  const idRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [diffFile, setDiffFile] = useState<DiffFile>();

  useEffect(() => {
    const cb = (event: MessageEvent<MessageData>) => {
      if (event.data.id === idRef.current) {
        if (event.data.bundle) {
          // Reconstruct DiffFile from the serialized bundle
          const file = DiffFile.createInstance(
            event.data.data || {},
            event.data.bundle
          );
          setDiffFile(file);
        }
        setLoading(false);
      }
    };
    diffFileWorker.addEventListener("message", cb);
    return () => diffFileWorker.removeEventListener("message", cb);
  }, []);

  const startLoading = () => {
    idRef.current += 1;
    setLoading(true);
    diffFileWorker.postMessage({
      id: idRef.current,
      data: {
        hunks: [patchString],
        newFile: { content: fileContent, fileName: "file.yaml" },
      },
      highlight: true,
    });
  };

  return (
    <div>
      <button onClick={startLoading} disabled={loading}>
        {loading ? "Loading..." : "Load Diff"}
      </button>
      {diffFile && (
        <DiffViewWithScrollBar
          diffFile={diffFile}
          diffViewHighlight
        />
      )}
    </div>
  );
}`;

const workerFileCode = `// worker.ts - runs in a separate thread
import { DiffFile } from "@git-diff-view/core";
import { highlighter } from "@git-diff-view/shiki";

export interface MessageData {
  id: number;
  data?: Record<string, any>;
  bundle?: ReturnType<DiffFile["getBundle"]>;
  error?: string;
}

self.onmessage = async (event) => {
  const { id, data, highlight } = event.data;
  try {
    const diffFile = DiffFile.createInstance(data);

    if (highlight) {
      // Syntax highlighting runs in the worker too
      diffFile.initSyntax(highlighter);
    }

    diffFile.initRaw();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();

    // Send the serializable bundle back to the main thread
    const bundle = diffFile.getBundle();
    self.postMessage({ id, data, bundle } as MessageData);
  } catch (e) {
    self.postMessage({
      id,
      error: (e as Error).message,
    } as MessageData);
  }
};`;

export const WorkerExample = () => {
  const idRef = useRef(0);

  const [loading, setLoading] = useState(false);

  const [diffFile, setDiffFile] = useState<DiffFile>();

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const cb = (event: MessageEvent<MessageData>) => {
      if (event.data.id === idRef.current) {
        if (event.data.bundle) {
          const diffFile = DiffFile.createInstance(event.data.data || {}, event.data.bundle);
          setDiffFile(diffFile);
        } else if (event.data.error) {
          void 0;
        }
        setLoading(false);
      }
    };

    diffFileWorker.addEventListener("message", cb);
  }, []);

  const startLoading = () => {
    idRef.current += 1;
    setLoading(true);
    const data = {
      id: idRef.current,
      data: {
        hunks: [patch],
        newFile: {
          content: newFileContent,
          fileName: "pnpm-lock.yaml",
        },
      },
      highlight: true,
    };
    diffFileWorker.postMessage(data);
  };

  return (
    <Box className="min-h-screen">
      <Container size="xl" py="xl">
        {/* Header */}
        <Box className="mb-8 text-center">
          <Group justify="center" gap="xs" mb="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "orange", to: "red", deg: 90 }}
              leftSection={<IconCpu size={16} />}
            >
              Performance
            </Badge>
          </Group>

          <Title
            order={1}
            className="mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-orange-400 dark:to-red-400"
          >
            Worker Example
          </Title>

          <Text size="lg" c="dimmed" className="mx-auto max-w-2xl">
            Offload large diff parsing to a Web Worker with <Code>worker</Code> / <Code>node server</Code>, keeping the
            UI thread responsive. Perfect for handling massive diffs.
          </Text>
        </Box>

        <Space h="xl" />

        {/* How to use */}
        <Accordion variant="separated" mb="xl">
          <Accordion.Item value="usage">
            <Accordion.Control icon={<IconCode size={20} />}>
              <Text fw={500}>Main Thread Code</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <SandpackProvider
                files={{ "/App.tsx": { code: usageCode, active: true } }}
                theme={colorScheme === "dark" ? "dark" : "light"}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                style={{ ["--sp-layout-height"]: "auto" }}
              >
                <SandpackLayout className="!rounded-[6px] border-none">
                  <SandpackCodeEditor showLineNumbers readOnly showReadOnly={false} />
                </SandpackLayout>
              </SandpackProvider>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="worker">
            <Accordion.Control icon={<IconCpu size={20} />}>
              <Text fw={500}>Worker File</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <SandpackProvider
                files={{ "/worker.ts": { code: workerFileCode, active: true } }}
                theme={colorScheme === "dark" ? "dark" : "light"}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                style={{ ["--sp-layout-height"]: "auto" }}
              >
                <SandpackLayout className="!rounded-[6px] border-none">
                  <SandpackCodeEditor showLineNumbers readOnly showReadOnly={false} />
                </SandpackLayout>
              </SandpackProvider>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="features">
            <Accordion.Control icon={<IconMessageCircle size={20} />}>
              <Text fw={500}>Features</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Box component="ul" className="list-disc pl-6">
                <li>
                  <Text>
                    <strong>Non-blocking:</strong> Diff parsing runs in a separate thread, keeping the UI responsive
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Serializable:</strong> Use <Code>DiffFile.getBundle()</Code> to serialize and{" "}
                    <Code>DiffFile.createInstance(data, bundle)</Code> to reconstruct
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Syntax highlighting:</strong> Highlighting can also run in the worker for zero main-thread
                    cost
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Server-side:</strong> Same pattern works with Node.js servers for SSR scenarios
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Large diffs:</strong> Handles files with thousands of changed lines without janking
                  </Text>
                </li>
              </Box>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* Live Demo */}
        <Box
          className="overflow-hidden rounded-xl border-2 border-solid"
          style={{
            borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
            backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
          }}
          p="md"
        >
          <Group mb="md">
            <IconPlayerPlay size={20} />
            <Title order={4}>Live Demo</Title>
            <Badge variant="light" color="orange">
              Try it!
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" mb="md">
            Click the button below to load a large diff file using a Web Worker. The UI stays responsive during
            parsing.
          </Text>

          <Box className="mb-4">
            <Button loading={loading} onClick={startLoading} color="orange">
              Start loading
            </Button>
          </Box>

          <Box
            className="relative min-h-40 overflow-hidden rounded-lg border border-solid"
            style={{
              borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
            }}
          >
            {diffFile && (
              <Box className="max-h-[calc(100vh-150px)] overflow-auto">
                <DiffViewWithScrollBar diffFile={diffFile} diffViewHighlight />
              </Box>
            )}
            {loading && <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
