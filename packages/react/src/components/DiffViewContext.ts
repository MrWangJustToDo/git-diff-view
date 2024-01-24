import { createContext, useContext } from "react";

import type { DiffViewProps, SplitSide } from "..";
import type { DiffFile } from "@git-diff-view/core";

export enum DiffModeEnum {
  Split = 1,
  Unified = 2,
}

export type DiffViewContextProps<T = any> = {
  id: string;
  mode: DiffModeEnum;
  fontSize: number;
  enableWrap?: boolean;
  enableHighlight: boolean;
  enableAddWidget?: boolean;
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
  }) => React.ReactNode;
  extendData?: DiffViewProps<T>["extendData"];
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
  }) => React.ReactNode;
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};

export const DiffViewContext = createContext<DiffViewContextProps>({
  id: "",
  mode: DiffModeEnum.Split,
  enableHighlight: true,
  enableAddWidget: true,
  enableWrap: true,
  fontSize: 13,
});

DiffViewContext.displayName = "DiffViewContext";

export const useDiffViewContext = () => useContext(DiffViewContext);
