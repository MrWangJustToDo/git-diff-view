import { DiffFile } from "@git-diff-view/core";
import { defineComponent, provide, ref, watch, watchEffect, computed } from "vue";

import {
  idSymbol,
  modeSymbol,
  fontSizeSymbol,
  enableWrapSymbol,
  enableHighlightSymbol,
  enableAddWidgetSymbol,
  extendDataSymbol,
  slotsSymbol,
  onAddWidgetClickSymbol,
  widgetStateSymbol,
  setWidgetStateSymbol,
} from "../context";
import { useIsMounted } from "../hooks/useIsMounted";
import { useProvide } from "../hooks/useProvide";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";

import type { highlighter } from "@git-diff-view/core";
import type { CSSProperties, SlotsType } from "vue";

export enum DiffModeEnum {
  Split = 1,
  Unified = 2,
}

export enum SplitSide {
  old = 1,
  new = 2,
}

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  class?: string;
  style?: CSSProperties;
  autoDetectLang?: boolean;
  registerHighlighter?: typeof highlighter;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
};

const diffFontSizeName = "--diff-font-size--";

type typeSlots = SlotsType<{
  widget: { lineNumber: number; side: SplitSide; diffFile: DiffFile; onClose: () => void };
  extend: { lineNumber: number; side: SplitSide; data: any; diffFile: DiffFile; onUpdate: () => void };
}>;

// vue 组件打包目前无法支持范型 也不支持 slots
export const DiffView = defineComponent<
  DiffViewProps<any>,
  { onAddWidgetClick: (lineNumber: number, side: SplitSide) => void },
  "onAddWidgetClick",
  typeSlots
>(
  (props, options) => {
    const getInstance = () => {
      if (props.diffFile) return props.diffFile;
      if (props.data)
        return new DiffFile(
          props.data.oldFile?.fileName || "",
          props.data.oldFile?.content || "",
          props.data.newFile?.fileName || "",
          props.data.newFile?.content || "",
          props.data.hunks || [],
          props.data.oldFile?.fileLang || "",
          props.data.newFile?.fileLang || ""
        );
      return null;
    };

    const diffFile = ref<DiffFile>(getInstance());

    const id = ref(diffFile.value?.getId?.());

    const widgetState = ref<{ side?: SplitSide; lineNumber?: number }>({});

    const setWidget = (v: { side?: SplitSide; lineNumber?: number }) => (widgetState.value = v);

    const enableHighlight = computed(() => props.diffViewHighlight ?? true);

    watch(
      () => props.diffFile,
      () => (diffFile.value = getInstance())
    );

    watch(
      () => props.data,
      () => (diffFile.value = getInstance()),
      { deep: true }
    );

    watch(
      () => diffFile.value,
      () => (widgetState.value = {})
    );

    const isMounted = useIsMounted();

    const initDiff = () => {
      if (!isMounted.value || !diffFile.value) return;
      const instance = diffFile.value;
      instance.initRaw();
      instance.buildSplitDiffLines();
      instance.buildUnifiedDiffLines();
    };

    const initSyntax = () => {
      if (!isMounted.value || !enableHighlight.value || !diffFile.value) return;
      const instance = diffFile.value;
      instance.initSyntax({ autoDetectLang: props.autoDetectLang, registerHighlighter: props.registerHighlighter });
      instance.notifyAll();
    };

    const initId = (onClean: (cb: () => void) => void) => {
      if (!diffFile.value) return;
      id.value = diffFile.value.getId();
      onClean(() => diffFile.value.clearId());
    };

    watchEffect(() => initDiff());

    watchEffect(() => initSyntax());

    watchEffect((onClean) => initId(onClean));

    provide(idSymbol, id);

    provide(slotsSymbol, options.slots);

    provide(onAddWidgetClickSymbol, options.emit);

    provide(widgetStateSymbol, widgetState);

    provide(setWidgetStateSymbol, setWidget);

    useProvide(props, "diffViewMode", modeSymbol);

    useProvide(props, "diffViewFontSize", fontSizeSymbol);

    useProvide(props, "diffViewWrap", enableWrapSymbol);

    useProvide(props, "diffViewHighlight", enableHighlightSymbol);

    useProvide(props, "diffViewAddWidget", enableAddWidgetSymbol);

    useProvide(props, "extendData", extendDataSymbol, true);

    return () => {
      if (!diffFile.value) return null;

      return (
        <div class="diff-tailwindcss-wrapper">
          <div class="diff-style-root" style={{ [diffFontSizeName]: props.diffViewFontSize + "px" }}>
            <div
              id={`diff-root${id.value}`}
              class={"diff-view-wrapper" + (props.class ? ` ${props.class}` : "")}
              style={props.style}
            >
              {!props.diffViewMode || props.diffViewMode === DiffModeEnum.Split ? (
                <DiffSplitView key={DiffModeEnum.Split} diffFile={diffFile.value as DiffFile} />
              ) : (
                <DiffUnifiedView key={DiffModeEnum.Unified} diffFile={diffFile.value as DiffFile} />
              )}
            </div>
          </div>
        </div>
      );
    };
  },
  {
    name: "DiffView",
    props: [
      "data",
      "class",
      "diffFile",
      "diffViewAddWidget",
      "diffViewFontSize",
      "diffViewHighlight",
      "diffViewMode",
      "diffViewWrap",
      "extendData",
      "autoDetectLang",
      "registerHighlighter",
      "style",
    ],
    slots: Object as typeSlots,
  }
);
