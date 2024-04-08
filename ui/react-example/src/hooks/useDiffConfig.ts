import { DiffModeEnum } from "@git-diff-view/react";
import { createState } from "reactivity-store";

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
      fontsize: 14,
      mode: DiffModeEnum.Split,
    }) as DiffConfig,
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
    withNamespace: "diffConfig",
    withDeepSelector: false,
  }
);
