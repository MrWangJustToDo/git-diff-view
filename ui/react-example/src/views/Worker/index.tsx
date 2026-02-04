import { DiffFile } from "@git-diff-view/react";
import { Box, Button, Code, LoadingOverlay } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import { DiffViewWithScrollBar } from "../../components/DiffViewWithScrollBar";

import { patch, newFileContent } from "./data";

import type { MessageData } from "../../worker";

const diffFileWorker = new Worker(new URL("../../worker.ts", import.meta.url), {
  type: "module",
});

export const WorkerExample = () => {
  const idRef = useRef(0);

  const [loading, setLoading] = useState(false);

  const [diffFile, setDiffFile] = useState<DiffFile>();

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
    <Box>
      <Box className="my-2 mb-4">
        <Button loading={loading} onClick={startLoading}>
          Start loading
        </Button>
        <span className="ml-4">
          Large diff load with <Code>worker</Code> / <Code>node server</Code>, it's very useful to avoid blocking the UI
          thread.
        </span>
      </Box>
      <Box className="border-color relative min-h-40 overflow-hidden rounded-md border">
        {diffFile && (
          <Box className="max-h-[calc(100vh-150px)] overflow-auto">
            <DiffViewWithScrollBar diffFile={diffFile} diffViewHighlight />
          </Box>
        )}
        {loading && <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
      </Box>
    </Box>
  );
};
