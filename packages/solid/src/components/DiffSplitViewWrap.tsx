import { getSplitContentLines, type DiffFile } from "@git-diff-view/core";
import { createSignal } from "solid-js";

export const DiffSplitViewWrap = (props: { diffFile: DiffFile }) => {
  const [] = createSignal(getSplitContentLines(props.diffFile));

  const [] = createSignal(props.diffFile.splitLineLength.toString());

  

  return <div>12</div>;
};
