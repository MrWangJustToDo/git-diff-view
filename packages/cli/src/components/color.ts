export { GitHubDark, GitHubLight } from "./highlightColor";

export type ThemeColor = { light: string; dark: string };

export interface DiffViewColorTheme {
  addContent?: ThemeColor;
  delContent?: ThemeColor;
  plainContent?: ThemeColor;
  expandContent?: ThemeColor;
  emptyContent?: ThemeColor;
  addLineNumber?: ThemeColor;
  delLineNumber?: ThemeColor;
  plainLineNumber?: ThemeColor;
  expandLineNumber?: ThemeColor;
  hunkLineNumber?: ThemeColor;
  plainLineNumberColor?: ThemeColor;
  expandLineNumberColor?: ThemeColor;
  hunkContentColor?: ThemeColor;
  addContentHighlight?: ThemeColor;
  delContentHighlight?: ThemeColor;
  hunkContent?: ThemeColor;
  border?: ThemeColor;
  noBGAddContent?: ThemeColor;
  noBGDelContent?: ThemeColor;
  noBGAddLineNumber?: ThemeColor;
  noBGDelLineNumber?: ThemeColor;
  noBGAddContentHighlight?: ThemeColor;
  noBGDelContentHighlight?: ThemeColor;
}

export type ResolvedDiffViewColorTheme = Required<DiffViewColorTheme>;

const defaultTheme: ResolvedDiffViewColorTheme = {
  addContent: { light: "#e6ffec", dark: "#14261f" },
  delContent: { light: "#ffebe9", dark: "#311b1f" },
  plainContent: { light: "#ffffff", dark: "#0d1117" },
  expandContent: { light: "#fafafa", dark: "#161b22" },
  emptyContent: { light: "#fafafa", dark: "#161b22" },
  addLineNumber: { light: "#ccffd8", dark: "#1f4429" },
  delLineNumber: { light: "#ffd7d5", dark: "#552527" },
  plainLineNumber: { light: "#fafafa", dark: "#161b22" },
  expandLineNumber: { light: "#fafafa", dark: "#161b22" },
  hunkLineNumber: { light: "#c7ecff", dark: "#204274" },
  plainLineNumberColor: { light: "#555555", dark: "#a0aaab" },
  expandLineNumberColor: { light: "#555555", dark: "#a0aaab" },
  hunkContentColor: { light: "#777777", dark: "#9298a0" },
  addContentHighlight: { light: "#abf2bc", dark: "#1f572d" },
  delContentHighlight: { light: "#ffb3ad", dark: "#80312f" },
  hunkContent: { light: "#ddf4ff", dark: "#131d2e" },
  border: { light: "#dedede", dark: "#3d444d" },
  noBGAddContent: { light: "#b7f0c4", dark: "#1a3a24" },
  noBGDelContent: { light: "#f5c2bf", dark: "#3f2022" },
  noBGAddLineNumber: { light: "#8ae09d", dark: "#27522f" },
  noBGDelLineNumber: { light: "#f0a9a5", dark: "#6d2d2f" },
  noBGAddContentHighlight: { light: "#5fce78", dark: "#286e38" },
  noBGDelContentHighlight: { light: "#f07e78", dark: "#a33e3b" },
};

export const buildTheme = (overrides?: DiffViewColorTheme): ResolvedDiffViewColorTheme => {
  if (!overrides) return defaultTheme;
  const result = { ...defaultTheme };
  for (const key of Object.keys(overrides) as (keyof DiffViewColorTheme)[]) {
    const val = overrides[key];
    if (val) {
      result[key] = { ...defaultTheme[key], ...val };
    }
  }
  return result;
};
