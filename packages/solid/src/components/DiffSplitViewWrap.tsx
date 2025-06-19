import { getSplitContentLines } from "@git-diff-view/core";
import { createMemo, createSignal } from "solid-js";

import { useFontSize } from "../hooks";

import type { DiffFile, SplitSide } from "@git-diff-view/core";

export const DiffSplitViewWrap = (props: { diffFile: DiffFile }) => {
  const [lines, setLines] = createSignal(getSplitContentLines(props.diffFile));

  const [maxText, setMaxText] = createSignal(props.diffFile.splitLineLength.toString());

  const [splitSideInfo, setSplitInfo] = createSignal<{ side?: SplitSide }>({ side: undefined });

  const fontSize = useFontSize();

  const font = createMemo(() => ({ fontSize: `${fontSize() || 14}px`, fontFamily: "Menlo, Consolas, monospace" }));

  return <div>12</div>;
};
