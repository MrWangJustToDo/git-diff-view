import { createStore, ref } from "reactivity-store";

import type { DiffModeEnum, DiffViewProps } from "./DiffView";

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
