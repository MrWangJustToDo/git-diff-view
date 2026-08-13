import { createStore, ref } from "reactivity-store";

import type { DiffModeEnum, DiffViewProps } from "./DiffView";

export const createDiffConfigStore = (props: DiffViewProps<any> & { isMounted: boolean }, diffFileId: string) => {
  return createStore(() => {
    const id = ref(diffFileId);

    const setId = (_id: string) => (id.value = _id);

    const mode = ref(props.diffViewMode);

    const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

    const mounted = ref(props.isMounted);

    const setMounted = (_mounted: boolean) => (mounted.value = _mounted);

    /** Unified only — Split always wraps. */
    const enableWrap = ref(props.diffViewWrap ?? true);

    const setEnableWrap = (_enableWrap: boolean) => (enableWrap.value = _enableWrap);

    const enableHighlight = ref(props.diffViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    const fontSize = ref(props.diffViewFontSize);

    const setFontSize = (_fontSize: number) => (fontSize.value = _fontSize);

    const theme = ref<"light" | "dark">(props.diffViewTheme || "light");

    const setTheme = (_theme: "light" | "dark") => (theme.value = _theme);

    const extendData = ref({
      oldFile: { ...props.extendData?.oldFile },
      newFile: { ...props.extendData?.newFile },
    });

    const setExtendData = (__extendData: DiffViewProps<any>["extendData"]) => {
      const _extendData = __extendData || {};
      const existOldKeys = Object.keys(extendData.value.oldFile || {});
      const inComingOldKeys = Object.keys(_extendData.oldFile || {});
      for (const key of existOldKeys) {
        if (!inComingOldKeys.includes(key)) {
          delete extendData.value.oldFile[key];
        }
      }
      for (const key of inComingOldKeys) {
        extendData.value.oldFile[key] = _extendData.oldFile![key];
      }
      const existNewKeys = Object.keys(extendData.value.newFile || {});
      const inComingNewKeys = Object.keys(_extendData.newFile || {});
      for (const key of existNewKeys) {
        if (!inComingNewKeys.includes(key)) {
          delete extendData.value.newFile[key];
        }
      }
      for (const key of inComingNewKeys) {
        extendData.value.newFile[key] = _extendData.newFile![key];
      }
    };

    const renderExtendLine = ref(props.renderExtendLine);

    const setRenderExtendLine = (_renderExtendLine: typeof renderExtendLine.value) =>
      (renderExtendLine.value = _renderExtendLine);

    const onDiffLineClick = ref(props.onDiffLineClick);

    const setOnDiffLineClick = (_onDiffLineClick: typeof onDiffLineClick.value) =>
      (onDiffLineClick.value = _onDiffLineClick);

    return {
      id,
      setId,
      mode,
      setMode,
      mounted,
      setMounted,
      enableWrap,
      setEnableWrap,
      enableHighlight,
      setEnableHighlight,
      fontSize,
      setFontSize,
      theme,
      setTheme,
      extendData,
      setExtendData,
      renderExtendLine,
      setRenderExtendLine,
      onDiffLineClick,
      setOnDiffLineClick,
    };
  });
};
