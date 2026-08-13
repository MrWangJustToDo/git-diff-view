export * from "@git-diff-view/core";

export { DiffModeEnum } from "@git-diff-view/utils";

import type { DiffFile, DiffHighlighter, DiffHighlighterLang, SplitSide } from "@git-diff-view/core";
import type { DiffModeEnum as DiffModeEnumType } from "@git-diff-view/utils";

export type DiffLineClickPayload = {
  lineNumber: number;
  oldLineNumber?: number;
  newLineNumber?: number;
  side?: SplitSide;
  type: "content" | "hunk" | "extend";
};

export type DiffViewProps<T = unknown> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  className?: string;
  style?: Record<string, string | number>;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnumType;
  /**
   * Line wrap. Affects Unified only — Split always wraps.
   * Unified `false`: nowrap + shared H scroll; line nums stay on the left.
   */
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  onDiffLineClick?: (payload: DiffLineClickPayload) => void;
  renderExtendLine?: (ctx: {
    lineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => any;
};

export declare const DiffView: <T = unknown>(props: DiffViewProps<T>) => any;

export declare const version: string;
