import { DiffModeEnum } from "@git-diff-view/react";
import { Menu, NumberInput } from "@mantine/core";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";

import type { DiffFile } from "@git-diff-view/react";
import type { ReactNode } from "react";

const highlightEngines = [
  { value: "lowlight", label: "lowlight", description: "Built-in highlight.js" },
  { value: "shiki", label: "shiki", description: "VS Code TextMate themes" },
  { value: "lezer", label: "lezer", description: "CodeMirror LR parsers" },
] as const;

/**
 * One option per line: `+ wrap` when enabled, `- wrap` struck through when disabled.
 * The live demo reads like a small config file rather than a row of buttons.
 */
const Flag = ({
  flag,
  on,
  disabled,
  hint,
  onClick,
  children,
}: {
  flag: string;
  on: boolean;
  disabled?: boolean;
  hint?: string;
  onClick?: () => void;
  children?: ReactNode;
}) => (
  <button
    type="button"
    title={hint}
    disabled={disabled}
    onClick={onClick}
    className={`flag ${on ? "flag-on" : "flag-off"}`}
  >
    <span className="w-3 shrink-0 text-center opacity-60">{on ? "+" : "−"}</span>
    <span>{flag}</span>
    {children}
  </button>
);

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
    if (!diffFile) return;

    const target = mode === DiffModeEnum.Unified ? "unified" : "split";

    if (expandAll) {
      diffFile.onAllCollapse(target);
    } else {
      diffFile.onAllExpand(target);
    }
  };

  const isSplit = mode === DiffModeEnum.Split;

  return (
    <div className="flex flex-col gap-1">
      <Flag
        flag="split"
        on={isSplit}
        hint="diff view mode"
        onClick={() => setMode(isSplit ? DiffModeEnum.Unified : DiffModeEnum.Split)}
      />
      <Flag flag="wrap" on={wrap} hint="code line mode" onClick={() => setWrap(!wrap)} />
      <Flag flag="highlight" on={highlight} hint="highlight status" onClick={() => setHighlight(!highlight)} />

      <Menu shadow="sm" width={230} position="bottom-start">
        <Menu.Target>
          <div>
            <Flag flag="engine" on={highlight} disabled={!highlight}>
              <span className="text-[var(--ink)] opacity-70">{engine}</span>
              <IconChevronDown size={11} className="opacity-60" />
            </Flag>
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label className="font-mono text-[10.5px] uppercase tracking-[0.12em]">highlight engine</Menu.Label>
          {highlightEngines.map((item) => (
            <Menu.Item
              key={item.value}
              leftSection={engine === item.value ? <IconCheck size={14} /> : <span className="inline-block w-[14px]" />}
              onClick={() => setEngine(item.value)}
            >
              <div className="font-mono">
                <div className="text-[12px]">{item.label}</div>
                <div className="text-[10.5px] opacity-60">{item.description}</div>
              </div>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      <Flag
        flag={expandAll ? "collapse-all" : "expand-all"}
        on={expandAll}
        hint="expand all lines"
        onClick={() => {
          toggleExpandAll();
          setExpandAll(!expandAll);
        }}
      />
      <Flag
        flag="range"
        on={rangeMode}
        hint="show only a portion of the diff"
        onClick={() => setRangeMode(!rangeMode)}
      />

      {rangeMode && (
        <div className="mt-2 flex gap-2">
          <NumberInput
            size="xs"
            value={rangeStart}
            min={0}
            label="start"
            max={diffFile?.splitLineLength}
            onChange={(n) => setRangeStart(Number(n))}
          />
          <NumberInput
            size="xs"
            value={rangeEnd}
            min={0}
            label="end"
            max={diffFile?.splitLineLength}
            onChange={(n) => setRangeEnd(Number(n))}
          />
        </div>
      )}
    </div>
  );
};
