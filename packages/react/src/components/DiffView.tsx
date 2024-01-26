/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DiffFile } from "@git-diff-view/core";
import { memo, useEffect, useMemo } from "react";
import * as React from "react";
import { createStore, ref } from "reactivity-store";

import { useCallbackRef } from "../hooks/useCallbackRef";
import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffModeEnum, DiffViewContext } from "./DiffViewContext";

import type { highlighter } from "@git-diff-view/core";
import type { CSSProperties, ReactNode } from "react";

const diffFontSizeName = "--diff-font-size--";

export enum SplitSide {
  old = 1,
  new = 2,
}

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  className?: string;
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
    diffFile: DiffFile;
    onClose: () => void;
  }) => ReactNode;
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
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => ReactNode;
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};

const _InternalDiffView = <T extends unknown>(props: Omit<DiffViewProps<T>, "data" | "registerHighlight">) => {
  const {
    diffFile,
    className,
    style,
    diffViewMode,
    diffViewWrap,
    diffViewFontSize,
    diffViewHighlight,
    renderWidgetLine,
    renderExtendLine,
    extendData,
    diffViewAddWidget,
    onAddWidgetClick,
  } = props;

  const memoOnAddWidgetClick = useCallbackRef(onAddWidgetClick);

  const diffFileId = useMemo(() => diffFile.getId(), [diffFile]);

  // performance optimization
  const useDiffContext = useMemo(
    () =>
      createStore(() => {
        const id = ref(diffFileId);

        const setId = (_id: string) => (id.value = _id);

        const mode = ref(props.diffViewMode);

        const setMode = (_mode: DiffModeEnum) => (mode.value = _mode);

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

        const renderWidgetLine = ref(props.renderWidgetLine);

        const setRenderWidgetLine = (_renderWidgetLine: typeof renderWidgetLine.value) =>
          (renderWidgetLine.value = _renderWidgetLine);

        const renderExtendLine = ref(props.renderExtendLine);

        const setRenderExtendLine = (_renderExtendLine: typeof renderExtendLine.value) =>
          (renderExtendLine.value = _renderExtendLine);

        const onAddWidgetClick = ref(props.onAddWidgetClick);

        const setOnAddWidgetClick = (_onAddWidgetClick: typeof onAddWidgetClick.value) =>
          (onAddWidgetClick.value = _onAddWidgetClick);

        return {
          id,
          setId,
          mode,
          setMode,
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
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const {
      setId,
      setMode,
      setEnableAddWidget,
      setEnableHighlight,
      setEnableWrap,
      setExtendData,
      setFontSize,
      setOnAddWidgetClick,
      setRenderExtendLine,
      setRenderWidgetLine,
    } = useDiffContext.getReadonlyState();

    setId(diffFileId);
    setMode(diffViewMode);
    setEnableAddWidget(diffViewAddWidget);
    setEnableHighlight(diffViewHighlight);
    setEnableWrap(diffViewWrap);
    setExtendData(extendData);
    setFontSize(diffViewFontSize);
    setOnAddWidgetClick(memoOnAddWidgetClick);
    setRenderExtendLine(renderExtendLine);
    setRenderWidgetLine(renderWidgetLine);
  }, [
    useDiffContext,
    diffViewFontSize,
    diffViewHighlight,
    diffViewMode,
    diffViewWrap,
    diffViewAddWidget,
    diffFileId,
    renderWidgetLine,
    renderExtendLine,
    extendData,
    memoOnAddWidgetClick,
  ]);

  useUnmount(() => diffFile.clearId(), [diffFile]);

  const value = useMemo(() => ({ useDiffContext }), [useDiffContext]);

  return (
    <DiffViewContext.Provider value={value}>
      <div className="diff-tailwindcss-wrapper">
        <div
          className="diff-style-root"
          style={{
            // @ts-ignore
            [diffFontSizeName]: diffViewFontSize + "px",
          }}
        >
          <div
            id={`diff-root${diffFileId}`}
            className={"diff-view-wrapper" + (className ? ` ${className}` : "")}
            style={style}
          >
            {diffViewMode === DiffModeEnum.Split ? (
              <DiffSplitView diffFile={diffFile} />
            ) : (
              <DiffUnifiedView diffFile={diffFile} />
            )}
          </div>
        </div>
      </div>
    </DiffViewContext.Provider>
  );
};

const InternalDiffView = memo(_InternalDiffView);

export const DiffView = <T extends unknown>(props: DiffViewProps<T>) => {
  const diffFile = useMemo(() => {
    if (props.diffFile) {
      return props.diffFile;
    } else if (props.data) {
      return new DiffFile(
        props.data?.oldFile?.fileName || "",
        props.data?.oldFile?.content || "",
        props.data?.newFile?.fileName || "",
        props.data?.newFile?.content || "",
        props.data?.hunks || [],
        props.data?.oldFile?.fileLang || "",
        props.data?.newFile?.fileLang || ""
      );
    }
    return null;
  }, [props.data, props.diffFile]);

  useEffect(() => {
    if (!diffFile) return;
    diffFile.initRaw();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();
  }, [diffFile]);

  useEffect(() => {
    if (!diffFile) return;
    if (props.diffViewHighlight) {
      diffFile.initSyntax();
      diffFile.notifyAll();
    }
  }, [diffFile, props.diffViewHighlight]);

  if (!diffFile) return null;

  return <InternalDiffView key={diffFile.getId()} {...props} diffFile={diffFile} />;
};
