import { createState } from "reactivity-store";

import { DiffModeEnum } from "../components/DiffViewContext";

type DiffConfig = {
  highlight: boolean;
  wrap: boolean;
  fontsize: number;
  mode: DiffModeEnum;
};

export const useDiffConfig = createState(
  () =>
    ({
      highlight: true,
      wrap: true,
      fontsize: 13,
      mode: DiffModeEnum.Unified,
    } as DiffConfig),
  {
    withActions(state) {
      return {
        setHighlight: (v: boolean) => {
          if (v !== state.highlight) {
            state.highlight = v;
          }
        },
        setWrap: (v: boolean) => {
          if (v !== state.wrap) {
            state.wrap = v;
          }
        },
        setFontSize: (v: number) => {
          if (v !== state.fontsize) {
            state.fontsize = v;
          }
        },
        setMode: (v: DiffModeEnum) => {
          if (v !== state.mode) {
            state.mode = v;
          }
        },
      };
    },
    withDeepSelector: false,
  }
);
