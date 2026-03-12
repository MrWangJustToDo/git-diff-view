import { createStore, markRaw, ref } from "reactivity-store";
import stringWidth from "string-width";

import type { CodeViewProps } from "./CodeView";
import type { DOMElement } from "ink";
import type { Ref, UseSelectorWithStore } from "reactivity-store";

export const createCodeConfigStore = <T = any>(props: CodeViewProps<T> & { isMounted: boolean }, fileId: string) => {
  return createStore(() => {
    const id = ref(fileId);

    const setId = (_id: string) => (id.value = _id);

    const tabSpace = ref(props.codeViewTabSpace);

    const setTabSpace = (_tabSpace: boolean) => (tabSpace.value = _tabSpace);

    const tabWidth = ref(props.codeViewTabWidth || "medium");

    const setTabWidth = (_tabWidth: "small" | "medium" | "large") => (tabWidth.value = _tabWidth);

    const wrapper = ref<{ current: DOMElement }>(markRaw({ current: null }));

    const setWrapper = (_wrapper?: DOMElement) => (wrapper.value = markRaw({ current: _wrapper }));

    const mounted = ref(props.isMounted);

    const setMounted = (_mounted: boolean) => (mounted.value = _mounted);

    const enableHighlight = ref(props.codeViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    const extendData = ref({
      ...props.extendData,
    });

    const setExtendData = (_extendData: CodeViewProps<any>["extendData"]) => {
      const existKeys = Object.keys(extendData.value || {});
      const inComingKeys = Object.keys(_extendData || {});
      for (const key of existKeys) {
        if (!inComingKeys.includes(key)) {
          delete extendData.value[key];
        }
      }
      for (const key of inComingKeys) {
        extendData.value[key] = _extendData[key];
      }
    };

    const renderExtendLine = ref(props.renderExtendLine);

    const setRenderExtendLine = (_renderExtendLine: typeof renderExtendLine.value) =>
      (renderExtendLine.value = _renderExtendLine);

    return {
      id,
      setId,
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
    extendData: Ref<Record<string, any>>;
    setExtendData: (extendData: CodeViewProps<any>["extendData"]) => void;
    renderExtendLine: Ref<typeof props.renderExtendLine>;
    setRenderExtendLine: (renderExtendLine: typeof props.renderExtendLine) => void;
  }>;
};

export const getCurrentLineRow = ({ content, width }: { content: string; width: number }) => {
  // Ensure minimum of 1 row for empty lines
  return Math.max(1, Math.ceil(stringWidth(content) / width));
};
