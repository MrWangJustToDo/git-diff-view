/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import * as React from "react";

import { useUnmount } from "../hooks/useUnmount";
import { DiffFileExtends } from "../utils";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffModeEnum, DiffViewContext } from "./DiffViewContext";

import type { DiffViewContextProps } from "./DiffViewContext";
import type { highlighter } from "@git-diff-view/core";
import type { CSSProperties } from "react";

const diffFontSizeName = "--diff-font-size--";

const idSet = new Set<string>();

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
  extendData?: { oldFile?: Record<string, { lineNumber: number; data: T }>; newFile?: Record<string, { lineNumber: number; data: T }> };
  diffFile?: DiffFileExtends;
  className?: string;
  style?: CSSProperties;
  registerHighlight?: typeof highlighter.register;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
  renderAddWidget?: DiffViewContextProps["renderAddWidget"];
  renderExtendLine?: DiffViewContextProps<T>["renderExtendLine"];
};

const InternalDiffView = <T extends unknown>(props: Omit<DiffViewProps<T>, "data" | "registerHighlight">) => {
  const {
    diffFile,
    className,
    style,
    diffViewMode,
    diffViewWrap,
    diffViewFontSize,
    diffViewHighlight,
    renderAddWidget,
    renderExtendLine,
    extendData,
    diffViewAddWidget,
  } = props;

  const id = useMemo(() => {
    let id = "--" + Math.random().toString().slice(2);
    while (idSet.has(id)) {
      id = "--" + Math.random().toString().slice(2);
    }
    idSet.add(id);
    return id;
  }, [diffFile]);

  const value = useMemo(
    () =>
      ({
        id,
        mode: diffViewMode,
        enableWrap: diffViewWrap,
        enableAddWidget: diffViewAddWidget,
        enableHighlight: diffViewHighlight,
        fontSize: diffViewFontSize,
        extendData,
        renderAddWidget,
        renderExtendLine,
      }) as DiffViewContextProps,
    [diffViewFontSize, diffViewHighlight, diffViewMode, diffViewWrap, diffViewAddWidget, id, renderAddWidget, renderExtendLine, extendData]
  );

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useUnmount(() => idSet.delete(id), [id]);

  return (
    <DiffViewContext.Provider value={value}>
      <div
        className="diff-style-root"
        style={{
          // @ts-ignore
          [diffFontSizeName]: diffViewFontSize + "px",
        }}
      >
        <div id={`diff-root${id}`} className={"diff-view-wrapper" + (className ? ` ${className}` : "")} style={style}>
          {diffViewMode === DiffModeEnum.Split ? <DiffSplitView diffFile={diffFile} /> : <DiffUnifiedView diffFile={diffFile} />}
        </div>
      </div>
    </DiffViewContext.Provider>
  );
};

export const DiffView = <T extends unknown>(props: DiffViewProps<T>) => {
  const diffFile = useMemo(() => {
    if (props.diffFile) {
      return props.diffFile;
    } else {
      return new DiffFileExtends(
        props.data?.oldFile?.fileName || "",
        props.data?.oldFile?.content || "",
        props.data?.newFile?.fileName || "",
        props.data?.newFile?.content || "",
        props.data?.hunks || [],
        props.data?.oldFile?.fileLang || "",
        props.data?.newFile?.fileLang || ""
      );
    }
  }, [props.data, props.diffFile]);

  useEffect(() => {
    diffFile.initRaw();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();
  }, [diffFile]);

  useEffect(() => {
    if (props.diffViewHighlight) {
      diffFile.initSyntax();
    }
  }, [diffFile, props.diffViewHighlight]);

  return <InternalDiffView {...props} diffFile={diffFile} />;
};
