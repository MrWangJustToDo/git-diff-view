import { createStore, ref } from "reactivity-store";

import type { DiffModeEnum, DiffViewProps, SplitSide } from "./DiffView";

export const createDiffConfigStore = (props: DiffViewProps<any>, diffFileId: string) => {
  return createStore(() => {
    const id = ref(diffFileId);

    const setId = (_id: string) => (id.value = _id);

    const mode = ref(props.diffViewMode);

    const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

    const isMounted = ref(false);

    const setIsIsMounted = (_isMounted: boolean) => (isMounted.value = _isMounted);

    const enableWrap = ref(props.diffViewWrap);

    const setEnableWrap = (_enableWrap: boolean) => (enableWrap.value = _enableWrap);

    const enableAddWidget = ref(props.diffViewAddWidget);

    const setEnableAddWidget = (_enableAddWidget: boolean) => (enableAddWidget.value = _enableAddWidget);

    const enableHighlight = ref(props.diffViewHighlight);

    const setEnableHighlight = (_enableHighlight: boolean) => (enableHighlight.value = _enableHighlight);

    const fontSize = ref(props.diffViewFontSize);

    const setFontSize = (_fontSize: number) => (fontSize.value = _fontSize);

    const extendData = ref({
      oldFile: { ...props.extendData?.oldFile },
      newFile: { ...props.extendData?.newFile },
    });

    const setExtendData = (_extendData: DiffViewProps<any>["extendData"]) => {
      extendData.value = { oldFile: { ..._extendData?.oldFile }, newFile: { ..._extendData?.newFile } };
    };

    const renderWidgetLine = ref(props.renderWidgetLine);

    const setRenderWidgetLine = (_renderWidgetLine: typeof renderWidgetLine.value) =>
      (renderWidgetLine.value = _renderWidgetLine);

    const renderExtendLine = ref(props.renderExtendLine);

    const setRenderExtendLine = (_renderExtendLine: typeof renderExtendLine.value) =>
      (renderExtendLine.value = _renderExtendLine);

    // 避免无意义的订阅
    const onAddWidgetClick = { current: props.onAddWidgetClick };

    const setOnAddWidgetClick = (_onAddWidgetClick: typeof onAddWidgetClick) =>
      (onAddWidgetClick.current = _onAddWidgetClick.current);

    return {
      id,
      setId,
      mode,
      setMode,
      isMounted,
      setIsIsMounted,
      enableWrap,
      setEnableWrap,
      enableAddWidget,
      setEnableAddWidget,
      enableHighlight,
      setEnableHighlight,
      fontSize,
      setFontSize,
      extendData,
      setExtendData,
      renderWidgetLine,
      setRenderWidgetLine,
      renderExtendLine,
      setRenderExtendLine,
      onAddWidgetClick,
      setOnAddWidgetClick,
    };
  });
};

export const createDiffWidgetStore = (useDiffContextRef: ReturnType<typeof createDiffConfigStore>) => {
  return createStore(() => {
    const widgetSide = ref<SplitSide>();

    const widgetLineNumber = ref<number>();

    const setWidget = ({ side, lineNumber }: { side?: SplitSide; lineNumber?: number }) => {
      const { renderWidgetLine } = useDiffContextRef?.getReadonlyState?.() || {};

      if (typeof renderWidgetLine !== "function") return;

      widgetSide.value = side;

      widgetLineNumber.value = lineNumber;
    };

    return { widgetSide, widgetLineNumber, setWidget };
  });
};
