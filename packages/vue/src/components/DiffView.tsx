/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineComponent, provide, ref, watch, watchEffect, h, Fragment, computed } from "vue";

import {
  idSymbol,
  type SplitSide,
  modeSymbol,
  fontSizeSymbol,
  enableWrapSymbol,
  enableHighlightSymbol,
  enableAddWidgetSymbol,
  renderWidgetLineSymbol,
  extendDataSymbol,
  renderExtendLineSymbol,
  onAddWidgetClickSymbol,
  type DiffModeEnum,
} from "../context";
import { useIsMounted } from "../hooks/useIsMounted";
import { useProvide } from "../hooks/useProvide";
import { DiffFileExtends } from "../utils";

import { DiffSplitView } from "./DiffSplitView";

import type { DiffFile, highlighter } from "@git-diff-view/core";
import type { CSSProperties, VNode } from "vue";

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content: string | null };
    hunks?: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFileExtends;
  class?: string;
  style?: CSSProperties;
  registerHighlight?: typeof highlighter.register;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
  renderWidgetLine?: ({
    diffFile,
    side,
    lineNumber,
    onClose,
  }: {
    lineNumber: number;
    side: SplitSide;
    diffFile: DiffFileExtends;
    onClose: () => void;
  }) => VNode;
  renderExtendLine?: ({
    diffFile,
    side,
    data,
    lineNumber,
    onUpdate,
  }: {
    lineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFileExtends;
    onUpdate: () => void;
  }) => VNode;
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};

const diffFontSizeName = "--diff-font-size--";

export const DiffView = defineComponent(
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  <T extends unknown>(props: DiffViewProps<T>) => {
    const getInstance = () =>
      props.diffFile ||
      new DiffFileExtends(
        props.data?.oldFile?.fileName || "",
        props.data?.oldFile?.content || "",
        props.data?.newFile?.fileName || "",
        props.data?.newFile?.content || "",
        props.data?.hunks || [],
        props.data?.oldFile?.fileLang || "",
        props.data?.newFile?.fileLang || ""
      );

    const diffFile = ref<DiffFile>(getInstance());

    const id = ref(diffFile.value.getId());

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

    const isMounted = useIsMounted();

    const initDiff = () => {
      if (!isMounted.value) return;
      const instance = diffFile.value;
      instance.initRaw();
      instance.buildSplitDiffLines();
      instance.buildUnifiedDiffLines();
    };

    const initSyntax = () => {
      if (!isMounted.value || !enableHighlight.value) return;
      const instance = diffFile.value;
      instance.initSyntax();
      instance.notifyAll();
    };

    const initId = (onClean: (cb: () => void) => void) => {
      id.value = diffFile.value.getId();
      onClean(() => diffFile.value.clearId);
    };

    watchEffect(() => initDiff());

    watchEffect(() => initSyntax());

    watchEffect((onClean) => initId(onClean));

    provide(idSymbol, id);

    useProvide(props, "diffViewMode", modeSymbol);

    useProvide(props, "diffViewFontSize", fontSizeSymbol);

    useProvide(props, "diffViewWrap", enableWrapSymbol);

    useProvide(props, "diffViewHighlight", enableHighlightSymbol);

    useProvide(props, "diffViewAddWidget", enableAddWidgetSymbol);

    useProvide(props, "renderWidgetLine", renderWidgetLineSymbol);

    useProvide(props, "extendData", extendDataSymbol);

    useProvide(props, "renderExtendLine", renderExtendLineSymbol);

    useProvide(props, "onAddWidgetClick", onAddWidgetClickSymbol);

    return () => (
      <div class="diff-style-root" style={{ [diffFontSizeName]: props.diffViewFontSize + "px" }}>
        <div id={`diff-root${id.value}`} class={"diff-view-wrapper" + (props.class ? ` ${props.class}` : "")} style={props.style}>
          <DiffSplitView diffFile={diffFile.value as DiffFile} />
        </div>
      </div>
    );
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
      "onAddWidgetClick",
      "registerHighlight",
      "renderExtendLine",
      "renderWidgetLine",
      "style",
    ],
  }
);
