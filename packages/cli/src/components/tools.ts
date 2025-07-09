import { createStore, ref } from "reactivity-store";

import type { DiffModeEnum, DiffViewProps } from "./DiffView";
import type { DiffLine } from "@git-diff-view/core";

export const createDiffConfigStore = (props: DiffViewProps & { isMounted: boolean }, diffFileId: string) => {
  return createStore(() => {
    const id = ref(diffFileId);

    const setId = (_id: string) => (id.value = _id);

    const mode = ref(props.diffViewMode);

    const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

    const mounted = ref(props.isMounted);

    const setMounted = (_mounted: boolean) => (mounted.value = _mounted);

    const enableHighlight = ref(props.diffViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    return {
      id,
      setId,
      mode,
      setMode,
      mounted,
      setMounted,
      enableHighlight,
      setEnableHighlight,
    };
  });
};

export const getCurrentLineRow = ({ content, width }: { content: string; width: number }) => {
  return Math.ceil(content.length / width);
};

export const getStringContentWithFixedWidth = ({
  diffLine,
  rawLine,
  width,
}: {
  diffLine?: DiffLine;
  rawLine: string;
  width: number;
}) => {
  if (!diffLine || !diffLine.changes) {
    const re: string[] = [];
    let temp = "";
    for (let i = 0; i < rawLine.length; i++) {
      if (temp.length === width) {
        re.push(temp);
        temp = rawLine[i];
      } else {
        temp += rawLine[i];
      }
    }
    if (temp) {
      re.push(temp);
    }
    return re.map((item) => item.padEnd(width, " "));
  }
};
