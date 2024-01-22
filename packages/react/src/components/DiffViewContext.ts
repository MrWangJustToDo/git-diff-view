import { createContext, useContext } from "react";

import type { DiffViewProps, SplitSide } from "..";
import type { DiffFileExtends } from "../utils";

export enum DiffModeEnum {
  Split,
  Unified,
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
    diffFile: DiffFileExtends;
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
    diffFile: DiffFileExtends;
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
