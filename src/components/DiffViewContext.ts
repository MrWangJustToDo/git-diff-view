import { ReactNode, createContext, useContext } from "react";

export enum DiffModeEnum {
  Split,
  Unified,
}

type DiffContext = {
  mode: DiffModeEnum;
  isWrap: boolean;
  fontSize: number;
  isHighlight: boolean;
  oldList: Record<number, ReactNode[]>;
  newList: Record<number, ReactNode[]>;
};

export const DiffViewContext = createContext<DiffContext>({
  mode: DiffModeEnum.Split,
  oldList: {},
  newList: {},
  isHighlight: true,
  fontSize: 13,
  isWrap: true,
});

export const useDiffViewContext = () => useContext(DiffViewContext);
