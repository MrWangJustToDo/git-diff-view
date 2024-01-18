import { createContext, useContext } from "react";

export enum DiffModeEnum {
  Split,
  Unified,
}

type DiffContext = {
  mode: DiffModeEnum;
  isWrap: boolean;
  fontSize: number;
  isHighlight: boolean;
};

export const DiffViewContext = createContext<DiffContext>({
  mode: DiffModeEnum.Split,
  isHighlight: true,
  fontSize: 13,
  isWrap: true,
});

export const useDiffViewContext = () => useContext(DiffViewContext);
