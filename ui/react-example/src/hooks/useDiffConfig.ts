import { DiffModeEnum } from "@git-diff-view/react";
import { createState } from "reactivity-store";

type DiffConfig = {
  highlight: boolean;
  wrap: boolean;
  fontsize: number;
  mode: DiffModeEnum;
  engine: "lowlight" | "shiki";
  tabSpace: boolean;
  fastDiff: boolean;
};

export const useDiffConfig = createState(
  () =>
    ({
      highlight: true,
      wrap: false,
      fontsize: 12,
      mode: DiffModeEnum.Split,
      engine: "lowlight",
      tabSpace: false,
      fastDiff: false,
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
        setTabSpace: (v: boolean) => {
          if (v !== state.tabSpace) {
            state.tabSpace = v;
          }
        },
        setFastDiff: (v: boolean) => {
          if (v !== state.fastDiff) {
            state.fastDiff = v;
          }
        }
      };
    },
    withNamespace: "diffConfig",
    withDeepSelector: false,
  }
);
