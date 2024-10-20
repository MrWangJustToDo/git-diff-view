import { generateDiffFile, DiffFile } from "@git-diff-view/file";
import { Button, ButtonGroup, FloatingIndicator, Group, LoadingOverlay, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCode, IconPlayerPlay, IconRefresh, IconBrandReact, IconBrandVue } from "@tabler/icons-react";
import { useState, startTransition, useCallback } from "react";

import { useDiffHighlighter } from "../hooks/useDiffHighlighter";

import { MainContentDiffExampleCode } from "./MainContentDiffExampleCode";
import { temp1, temp2 } from "./MainContentDiffExampleData";
import { MainContentDiffExampleView } from "./MainContentDiffExampleView";

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

export const MainContentDiffExample = () => {
  const [code, { open, close }] = useDisclosure();

  const [platform, setPlatform] = useState<"react" | "vue">("react");

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

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);

  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});

  return (
    <>
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
                ref={useCallback((node: HTMLButtonElement) => setControlsRefs((l) => ({ ...l, preview: node })), [])}
              >
                <IconPlayerPlay className="w-[1.2em]" />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <FloatingIndicator
            target={controlsRefs[code ? "code" : "preview"]}
            parent={rootRef}
            className="z-[-1] rounded-[var(--mantine-radius-default)] bg-[var(--mantine-color-violet-light)]"
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
              {platform === "react" ? <IconBrandReact className="w-[1.2em]" /> : <IconBrandVue className="w-[1.2em]" />}
            </Button>
          </Tooltip>
        )}
      </Group>

      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {code ? (
        <MainContentDiffExampleCode type={platform} />
      ) : (
        <MainContentDiffExampleView diffFile={diffFile} highlighter={highlighter} refreshDiffFile={refreshFile} />
      )}
    </>
  );
};
