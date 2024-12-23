import { DiffFile} from "@git-diff-view/core";
import { type JSXElement, type JSX, createSignal, createRenderEffect } from "solid-js";

import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";

export enum SplitSide {
  old = 1,
  new = 2,
}

export enum DiffModeEnum {
  // github like
  SplitGitHub = 1,
  // gitlab like
  SplitGitLab = 2,
  Split = 1 | 2,
  Unified = 4,
}

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  class?: string;
  style?: JSX.CSSProperties;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
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
  }) => JSXElement;
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
  }) => JSXElement;
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};

export const DiffView = <T extends unknown>(props: DiffViewProps<T>) => {
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

  const [diffFile, setDiffFile] = createSignal(getInstance());

  createRenderEffect(() => {
    diffFile()?.clear();

    setDiffFile(getInstance());
  })

  return <div>DiffView</div>;
}