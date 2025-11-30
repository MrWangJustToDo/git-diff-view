import { generateDiffFile, DiffFile } from "@git-diff-view/file";
import { Button, ButtonGroup, Card, FloatingIndicator, Group, LoadingOverlay, Popover, Tooltip } from "@mantine/core";
import { useCallbackRef, useDisclosure, useMounted } from "@mantine/hooks";
import { IconCode, IconPlayerPlay, IconRefresh, IconBrandReact, IconBrandVue } from "@tabler/icons-react";
import { useState, startTransition, useCallback, forwardRef, useMemo, useEffect } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";
import { useDiffHighlighter } from "../../hooks/useDiffHighlighter";
import { generateDynamicHunks, parseHunk } from "../../utils/hunk";

import { MainContentDiffExampleCode } from "./MainContentDiffExampleCode";
import { temp1, temp2 } from "./MainContentDiffExampleData";
import { MainContentDiffExampleViewWrapper } from "./MainContentDiffExampleViewWrapper";

import type { DiffViewProps } from "@git-diff-view/react";

const _diffFile = generateDiffFile("temp1.tsx", temp1, "temp2.tsx", temp2, "tsx", "tsx");

export const defaultComment: DiffViewProps<string[]>["extendData"] = {
  oldFile: {
    2: { data: ['console.log("hello world");'] },
  },
  newFile: {},
};

const getNewDiffFile = () => {
  const isEnableAutoExpandCommentLine = useDiffConfig.getReadonlyState().autoExpandCommentLine;

  const instance = DiffFile.createInstance({
    oldFile: { content: temp1, fileName: "temp1.tsx" },
    newFile: { content: temp2, fileName: "temp2.tsx" },
    hunks: isEnableAutoExpandCommentLine
      ? generateDynamicHunks({
          hunks: parseHunk(_diffFile._diffList[0]),
          comments: defaultComment,
          oldFile: temp1,
          newFile: temp2,
        }).map((i) => i.patchContent)
      : _diffFile._diffList,
  });
  instance.initRaw();
  return instance;
};

export const MainContentDiffExample = ({ onUpdate }: { onUpdate?: (diffFile: DiffFile) => void }) => {
  const [code, { open, close }] = useDisclosure();

  const isMounted = useMounted();

  const [platform, setPlatform] = useState<"react" | "vue">("react");

  const [showCode, setShowCode] = useState(true);

  const closeShowCode = () => setShowCode(false);

  const [showPlatform, setShowPlatform] = useState(true);

  const closePlatform = () => setShowPlatform(false);

  const [loading, setLoading] = useState(false);

  const refreshFile = useCallbackRef(() => {
    setLoading(true);
    setDiffFile(getNewDiffFile());
    // simulate loading
    setTimeout(() => {
      startTransition(() => setLoading(false));
    }, 800);
  });

  const [diffFile, setDiffFile] = useState(() => getNewDiffFile());

  const highlighter = useDiffHighlighter({ setLoading });

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);

  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (onUpdate) {
      onUpdate(diffFile);
    }
  }, [diffFile]);

  const Element = useMemo(
    () =>
      forwardRef<HTMLButtonElement, any>(({ onClick, ...props }, ref) => (
        <Tooltip label="show the code">
          <Button
            variant="light"
            size="compact-sm"
            onClick={(e) => {
              onClick?.(e);
              open();
            }}
            color="gray"
            ref={useCallback((node: HTMLButtonElement) => {
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
              setControlsRefs((l) => ({ ...l, code: node }));
            }, [])}
            {...props}
          >
            <IconCode className="w-[1.2em]" />
          </Button>
        </Tooltip>
      )),
    []
  );

  const PlatformSwitchElement = useMemo(
    () =>
      forwardRef<HTMLButtonElement, any>(({ onClick, ...props }, ref) => (
        <Tooltip label="switch the platform">
          <Button
            variant="light"
            size="compact-sm"
            ref={ref}
            onClick={(e) => {
              onClick?.(e);
              setPlatform(platform === "react" ? "vue" : "react");
            }}
            {...props}
          >
            {platform === "react" ? <IconBrandReact className="w-[1.2em]" /> : <IconBrandVue className="w-[1.2em]" />}
          </Button>
        </Tooltip>
      )),
    [platform]
  );

  return (
    <>
      <Group className="fixed right-6 top-2 z-10">
        <div ref={setRootRef}>
          <ButtonGroup>
            <Popover withArrow opened={showCode && isMounted} onClose={closeShowCode} closeOnClickOutside={false}>
              <Popover.Target>
                <Element onClick={closeShowCode} />
              </Popover.Target>
              <Popover.Dropdown className="animate-float">
                <Card>
                  <Card.Section>Click to show the code ✨✨</Card.Section>
                </Card>
                <Button size="compact-sm" className="float-right" onClick={closeShowCode}>
                  Close
                </Button>
              </Popover.Dropdown>
            </Popover>
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
          <Popover withArrow opened={showPlatform} onClose={closePlatform} closeOnClickOutside={false}>
            <Popover.Target>
              <PlatformSwitchElement onClick={closePlatform} />
            </Popover.Target>
            <Popover.Dropdown className="animate-float">
              <Card>
                <Card.Section>Click to show the other platform code ✨✨</Card.Section>
              </Card>
              <Button size="compact-sm" className="float-right" onClick={closePlatform}>
                Close
              </Button>
            </Popover.Dropdown>
          </Popover>
        )}
      </Group>

      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {code ? (
        <MainContentDiffExampleCode type={platform} />
      ) : (
        <MainContentDiffExampleViewWrapper
          diffFile={diffFile}
          highlighter={highlighter}
          refreshDiffFile={refreshFile}
        />
        // <MainContentDiffExampleView diffFile={diffFile} highlighter={highlighter} refreshDiffFile={refreshFile} />
      )}
    </>
  );
};
