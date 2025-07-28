import { createStore, markRaw, ref } from "reactivity-store";

import type { DiffModeEnum, DiffViewProps } from "./DiffView";
import type { DiffLine } from "@git-diff-view/core";
import type { DOMElement } from "ink";
import type { Ref, UseSelectorWithStore } from "reactivity-store";

export const createDiffConfigStore = (props: DiffViewProps & { isMounted: boolean }, diffFileId: string) => {
  return createStore(() => {
    const id = ref(diffFileId);

    const setId = (_id: string) => (id.value = _id);

    const mode = ref(props.diffViewMode);

    const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

    const wrapper = ref<{ current: DOMElement }>(markRaw({ current: null }));

    const setWrapper = (_wrapper?: DOMElement) => (wrapper.value = markRaw({ current: _wrapper }));

    const mounted = ref(props.isMounted);

    const setMounted = (_mounted: boolean) => (mounted.value = _mounted);

    const enableHighlight = ref(props.diffViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    return {
      id,
      setId,
      mode,
      setMode,
      wrapper,
      setWrapper,
      mounted,
      setMounted,
      enableHighlight,
      setEnableHighlight,
    };
    // fix rollup type error
  }) as UseSelectorWithStore<{
    id: Ref<string>;
    setId: (id: string) => void;
    mode: Ref<DiffModeEnum>;
    setMode: (mode: DiffModeEnum) => void;
    wrapper: Ref<{ current: DOMElement }>;
    setWrapper: (wrapper?: DOMElement) => void;
    mounted: Ref<boolean>;
    setMounted: (mounted: boolean) => void;
    enableHighlight: Ref<boolean>;
    setEnableHighlight: (enableHighlight: boolean) => void;
  }>;
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
