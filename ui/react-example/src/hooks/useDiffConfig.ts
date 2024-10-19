import { DiffModeEnum } from "@git-diff-view/react";
import { createState } from "reactivity-store";

type DiffConfig = {
  highlight: boolean;
  wrap: boolean;
  fontsize: number;
  mode: DiffModeEnum;
  engine: "lowlight" | "shiki";
};

export const useDiffConfig = createState(
  () =>
    ({
      highlight: true,
      wrap: false,
      fontsize: 12,
      mode: DiffModeEnum.Split,
      engine: "lowlight",
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
        setEngine: (v: "lowlight" | "shiki") => {
          if (v !== state.engine) {
            state.engine = v;
          }
        },
      };
    },
    withNamespace: "diffConfig",
    withDeepSelector: false,
  }
);
