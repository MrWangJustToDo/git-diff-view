import { DiffModeEnum } from "@git-diff-view/react";
import { Button, Group, Tooltip, Collapse, NumberInput, Stack, Menu } from "@mantine/core";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";

import type { DiffFile } from "@git-diff-view/react";

const highlightEngines = [
  { value: "lowlight", label: "lowlight", description: "Built-in highlight.js" },
  { value: "shiki", label: "shiki", description: "VS Code TextMate themes" },
  { value: "lezer", label: "lezer", description: "CodeMirror LR parsers" },
] as const;

export const MainContentDiffConfig = ({ diffFile }: { diffFile?: DiffFile }) => {
  const {
    mode,
    setEngine,
    setHighlight,
    setMode,
    setWrap,
    wrap,
    engine,
    highlight,
    rangeMode,
    setRangeMode,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
  } = useDiffConfig();

  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    if (diffFile) {
      if (mode === DiffModeEnum.Unified) {
        setExpandAll(diffFile.hasExpandUnifiedAll);
      } else {
        setExpandAll(diffFile.hasExpandSplitAll);
      }
    }
  }, [diffFile, mode]);

  const toggleExpandAll = () => {
    if (diffFile) {
      if (mode === DiffModeEnum.Unified) {
        if (expandAll) {
          diffFile.onAllCollapse("unified");
        } else {
          diffFile.onAllExpand("unified");
        }
      } else {
        if (expandAll) {
          diffFile.onAllCollapse("split");
        } else {
          diffFile.onAllExpand("split");
        }
      }
    }
  };

  return (
    <Stack gap="sm">
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
        <Menu shadow="md" width={220} position="bottom-start">
          <Menu.Target>
            <Button disabled={!highlight} rightSection={<IconChevronDown size={14} />}>
              {engine}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Highlight engine</Menu.Label>
            {highlightEngines.map((item) => (
              <Menu.Item
                key={item.value}
                leftSection={
                  engine === item.value ? <IconCheck size={14} /> : <span className="inline-block w-[14px]" />
                }
                onClick={() => setEngine(item.value)}
              >
                <Stack gap={0}>
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">{item.description}</span>
                </Stack>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
        <Tooltip label="expand all lines">
          <Button
            onClick={() => {
              toggleExpandAll();
              setExpandAll(!expandAll);
            }}
          >
            {expandAll ? "collapse all" : "expand all"}
          </Button>
        </Tooltip>
        <Tooltip label="show only a portion of the diff">
          <Button onClick={() => setRangeMode(!rangeMode)}>{rangeMode ? "disable range" : "enable range"}</Button>
        </Tooltip>
      </Group>
      <Collapse in={rangeMode}>
        <Group gap="sm">
          <NumberInput
            size="xs"
            value={rangeStart}
            min={0}
            label="Range Start"
            max={diffFile?.splitLineLength}
            onChange={(n) => setRangeStart(Number(n))}
          />
          <NumberInput
            size="xs"
            value={rangeEnd}
            min={0}
            label="Range End"
            max={diffFile?.splitLineLength}
            onChange={(n) => setRangeEnd(Number(n))}
          />
        </Group>
      </Collapse>
    </Stack>
  );
};
