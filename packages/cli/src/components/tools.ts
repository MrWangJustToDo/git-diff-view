import { createStore, markRaw, ref } from "reactivity-store";
import stringWidth from "string-width";

import type { DiffModeEnum, DiffViewProps } from "./DiffView";
import type { DiffLine } from "@git-diff-view/core";
import type { DOMElement } from "ink";
import type { Ref, UseSelectorWithStore } from "reactivity-store";

export const createDiffConfigStore = <T = any>(
  props: DiffViewProps<T> & { isMounted: boolean },
  diffFileId: string
) => {
  return createStore(() => {
    const id = ref(diffFileId);

    const setId = (_id: string) => (id.value = _id);

    const mode = ref(props.diffViewMode);

    const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

    const tabSpace = ref(props.diffViewTabSpace);

    const setTabSpace = (_tabSpace: boolean) => (tabSpace.value = _tabSpace);

    const tabWidth = ref(props.diffViewTabWidth || "medium");

    const setTabWidth = (_tabWidth: "small" | "medium" | "large") => (tabWidth.value = _tabWidth);

    const wrapper = ref<{ current: DOMElement }>(markRaw({ current: null }));

    const setWrapper = (_wrapper?: DOMElement) => (wrapper.value = markRaw({ current: _wrapper }));

    const mounted = ref(props.isMounted);

    const setMounted = (_mounted: boolean) => (mounted.value = _mounted);

    const enableHighlight = ref(props.diffViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    const extendData = ref({
      oldFile: { ...props.extendData?.oldFile },
      newFile: { ...props.extendData?.newFile },
    });

    const setExtendData = (_extendData: DiffViewProps<any>["extendData"]) => {
      const existOldKeys = Object.keys(extendData.value.oldFile || {});
      const inComingOldKeys = Object.keys(_extendData.oldFile || {});
      for (const key of existOldKeys) {
        if (!inComingOldKeys.includes(key)) {
          delete extendData.value.oldFile[key];
        }
      }
      for (const key of inComingOldKeys) {
        extendData.value.oldFile[key] = _extendData.oldFile[key];
      }
      const existNewKeys = Object.keys(extendData.value.newFile || {});
      const inComingNewKeys = Object.keys(_extendData.newFile || {});
      for (const key of existNewKeys) {
        if (!inComingNewKeys.includes(key)) {
          delete extendData.value.newFile[key];
        }
      }
      for (const key of inComingNewKeys) {
        extendData.value.newFile[key] = _extendData.newFile[key];
      }
    };

    const renderExtendLine = ref(props.renderExtendLine);

    const setRenderExtendLine = (_renderExtendLine: typeof renderExtendLine.value) =>
      (renderExtendLine.value = _renderExtendLine);

    return {
      id,
      setId,
      mode,
      setMode,
      wrapper,
      setWrapper,
      mounted,
      setMounted,
      tabSpace,
      setTabSpace,
      tabWidth,
      setTabWidth,
      enableHighlight,
      setEnableHighlight,
      extendData,
      setExtendData,
      renderExtendLine,
      setRenderExtendLine,
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
    tabSpace: Ref<boolean>;
    setTabSpace: (tabSpace: boolean) => void;
    tabWidth: Ref<"small" | "medium" | "large">;
    setTabWidth: (tabWidth: "small" | "medium" | "large") => void;
    enableHighlight: Ref<boolean>;
    setEnableHighlight: (enableHighlight: boolean) => void;
    extendData: Ref<{
      oldFile: Record<string, any>;
      newFile: Record<string, any>;
    }>;
    setExtendData: (extendData: DiffViewProps<any>["extendData"]) => void;
    renderExtendLine: Ref<typeof props.renderExtendLine>;
    setRenderExtendLine: (renderExtendLine: typeof props.renderExtendLine) => void;
  }>;
};

export const getCurrentLineRow = ({ content, width }: { content: string; width: number }) => {
  return Math.ceil(stringWidth(content) / width);
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
