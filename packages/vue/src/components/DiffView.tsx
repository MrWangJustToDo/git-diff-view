import { DiffFile, _cacheMap, SplitSide } from "@git-diff-view/core";
import { diffFontSizeName, DiffModeEnum } from "@git-diff-view/utils";
import { defineComponent, provide, ref, watch, watchEffect, computed, onUnmounted } from "vue";

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
  mountedSymbol,
} from "../context";
import { useIsMounted } from "../hooks/useIsMounted";
import { useProvide } from "../hooks/useProvide";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";

import type { DiffHighlighter } from "@git-diff-view/core";
import type { CSSProperties, SlotsType } from "vue";

_cacheMap.name = "@git-diff-view/vue";

export { SplitSide, DiffModeEnum };

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  initialWidgetState?: { side: SplitSide; lineNumber: number };
  diffFile?: DiffFile;
  class?: string;
  style?: CSSProperties;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
};

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
      if (props.diffFile) {
        const diffFile = DiffFile.createInstance({});
        diffFile._mergeFullBundle(props.diffFile._getFullBundle());
        return diffFile;
      }
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

    const wrapperRef = ref<HTMLDivElement>();

    const setWidget = (v: { side?: SplitSide; lineNumber?: number }) => {
      if (typeof options.slots.widget === "function") {
        widgetState.value = v;
      }
    };

    const enableHighlight = computed(() => props.diffViewHighlight ?? true);

    const theme = computed(() => props.diffViewTheme);

    watch(
      () => props.diffFile,
      () => {
        diffFile.value?.clear?.();
        diffFile.value = getInstance();
      },
      { immediate: true }
    );

    watch(
      () => props.initialWidgetState,
      () => {
        if (props.initialWidgetState) {
          widgetState.value = {
            side: props.initialWidgetState.side,
            lineNumber: props.initialWidgetState.lineNumber,
          };
        }
      },
      { immediate: true, deep: true }
    );

    watch(
      () => props.data,
      () => {
        diffFile.value?.clear?.();
        diffFile.value = getInstance();
      },
      { immediate: true, deep: true }
    );

    watch(
      () => diffFile.value,
      () => (widgetState.value = {})
    );

    const isMounted = useIsMounted();

    const initSubscribe = (onClean: (cb: () => void) => void) => {
      if (!isMounted.value || !diffFile.value || !props.diffFile) return;
      const instance = diffFile.value as DiffFile;
      props.diffFile._addClonedInstance(instance);
      onClean(() => props.diffFile._delClonedInstance(instance));
    };

    const initDiff = () => {
      if (!isMounted.value || !diffFile.value) return;
      const instance = diffFile.value;
      instance.initTheme(theme.value);
      instance.initRaw();
      instance.buildSplitDiffLines();
      instance.buildUnifiedDiffLines();
    };

    const initSyntax = () => {
      if (!isMounted.value || !enableHighlight.value || !diffFile.value) return;
      
      const instance = diffFile.value;
      instance.initSyntax({
        registerHighlighter: props.registerHighlighter,
      });
      instance.notifyAll();
    };

    const initAttribute = (onClean: (cb: () => void) => void) => {
      if (!isMounted.value || !diffFile.value || !wrapperRef.value) return;
      const instance = diffFile.value;
      // hack to track the value change
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      theme.value;
      const init = () => {
        wrapperRef.value?.setAttribute("data-theme", instance._getTheme() || "light");
        wrapperRef.value?.setAttribute("data-highlighter", instance._getHighlighterName());
      }

      init();

      const cb = instance.subscribe(init);

      onClean(() => cb());
    };

    const initId = (onClean: (cb: () => void) => void) => {
      if (!diffFile.value) return;
      const instance = diffFile.value;
      id.value = instance.getId();
      onClean(() => instance.clearId());
    };

    watchEffect((onClean) => initSubscribe(onClean));

    watchEffect(() => initDiff());

    watchEffect(() => initSyntax());

    watchEffect((onClean) => initId(onClean));

    watchEffect((onClean) => initAttribute(onClean));

    provide(idSymbol, id);

    provide(mountedSymbol, isMounted);

    provide(slotsSymbol, options.slots);

    provide(onAddWidgetClickSymbol, options.emit);

    provide(widgetStateSymbol, widgetState);

    provide(setWidgetStateSymbol, setWidget);

    useProvide(props, "diffViewMode", modeSymbol, { defaultValue: DiffModeEnum.SplitGitHub });

    useProvide(props, "diffViewFontSize", fontSizeSymbol, { defaultValue: 14 });

    useProvide(props, "diffViewWrap", enableWrapSymbol);

    useProvide(props, "diffViewHighlight", enableHighlightSymbol);

    useProvide(props, "diffViewAddWidget", enableAddWidgetSymbol);

    useProvide(props, "extendData", extendDataSymbol, { deepWatch: true });

    onUnmounted(() => diffFile.value?.clear?.());

    options.expose({ getDiffFileInstance: () => diffFile.value });

    return () => {
      if (!diffFile.value) return null;

      return (
        <div
          class="diff-tailwindcss-wrapper"
          data-component="git-diff-view"
          data-theme={diffFile.value._getTheme() || "light"}
          data-version={__VERSION__}
          data-highlighter={diffFile.value._getHighlighterName()}
          ref={wrapperRef}
        >
          <div class="diff-style-root" style={{ [diffFontSizeName]: (props.diffViewFontSize || 14) + "px" }}>
            <div
              // fix ssr mismatch error
              id={isMounted.value ? `diff-root${id.value}` : undefined}
              class={"diff-view-wrapper" + (props.class ? ` ${props.class}` : "")}
              style={props.style}
            >
              {!props.diffViewMode || props.diffViewMode & DiffModeEnum.Split ? (
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
      "diffViewTheme",
      "extendData",
      "registerHighlighter",
      "initialWidgetState",
      "style",
    ],
    // expose: ["getDiffView"],
    slots: Object as typeSlots,
  }
);

export const version = __VERSION__;
