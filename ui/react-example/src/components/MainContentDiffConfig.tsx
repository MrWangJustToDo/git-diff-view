import { DiffModeEnum } from "@git-diff-view/react";
import { Button, Group, Tooltip } from "@mantine/core";

import { useDiffConfig } from "../hooks/useDiffConfig";

export const MainContentDiffConfig = ({ refreshFile }: { refreshFile: () => void }) => {
  const { mode, setEngine, setHighlight, setMode, setWrap, wrap, engine, highlight } = useDiffConfig();

  return (
    <Group>
      <Tooltip label="diff view mode">
        <Button onClick={() => setMode(mode === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split)}>
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
            setEngine(engine === "lowlight" ? "shiki" : "lowlight");
            refreshFile();
          }}
        >
          {engine}
        </Button>
      </Tooltip>
    </Group>
  );
};
