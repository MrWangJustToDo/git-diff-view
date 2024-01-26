import { defineComponent } from "vue";

import { useEnableWrap } from "../context";

import { DiffSplitViewNormal } from "./DiffSplitViewNormal";
import { DiffSplitViewWrap } from "./DiffSplitViewWrap";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitView = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const enableWrap = useEnableWrap();

    return () => {
      return enableWrap.value ? (
        <DiffSplitViewWrap diffFile={props.diffFile} />
      ) : (
        <DiffSplitViewNormal diffFile={props.diffFile} />
      );
    };
  },
  { name: "DiffSplitView", props: ["diffFile"] }
);
