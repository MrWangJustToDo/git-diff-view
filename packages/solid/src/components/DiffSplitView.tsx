import { Show } from "solid-js";

import { useEnableWrap } from "../hooks";

import { DiffSplitViewNormal } from "./DiffSplitViewNormal";
import { DiffSplitViewWrap } from "./DiffSplitViewWrap";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitView = (props: { diffFile: DiffFile }) => {
  const enableWrap = useEnableWrap();

  return (
    <Show when={enableWrap()} fallback={<DiffSplitViewNormal diffFile={props.diffFile} />}>
      <DiffSplitViewWrap diffFile={props.diffFile} />
    </Show>
  );
};
