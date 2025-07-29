// color from gemini-cli  SEE https://github.com/google-gemini/gemini-cli/tree/main/packages/cli/src/ui/themes

const githubLightColors = {
  type: "light",
  Background: "#f8f8f8",
  Foreground: "#24292E",
  LightBlue: "#0086b3",
  AccentBlue: "#458",
  AccentPurple: "#900",
  AccentCyan: "#009926",
  AccentGreen: "#008080",
  AccentYellow: "#990073",
  AccentRed: "#d14",
  DiffAdded: "#C6EAD8",
  DiffRemoved: "#FFCCCC",
  Comment: "#998",
  Gray: "#999",
  GradientColors: ["#458", "#008080"],
} as const;

const githubDarkColors = {
  type: "dark",
  Background: "#24292e",
  Foreground: "#d1d5da",
  LightBlue: "#79B8FF",
  AccentBlue: "#79B8FF",
  AccentPurple: "#B392F0",
  AccentCyan: "#9ECBFF",
  AccentGreen: "#85E89D",
  AccentYellow: "#FFAB70",
  AccentRed: "#F97583",
  DiffAdded: "#3C4636",
  DiffRemoved: "#502125",
  Comment: "#6A737D",
  Gray: "#6A737D",
  GradientColors: ["#79B8FF", "#85E89D"],
} as const;

export const GitHubLight = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    background: githubLightColors.Background,
    color: githubLightColors.Foreground,
  },
  "hljs-keyword": {
    color: githubLightColors.AccentBlue,
  },
  "hljs-literal": {
    color: githubLightColors.AccentBlue,
  },
  "hljs-symbol": {
    color: githubLightColors.AccentBlue,
  },
  "hljs-name": {
    color: githubLightColors.AccentBlue,
  },
  "hljs-link": {
    color: githubLightColors.AccentBlue,
    textDecoration: "underline",
  },
  "hljs-built_in": {
    color: githubLightColors.AccentCyan,
  },
  "hljs-type": {
    color: githubLightColors.AccentCyan,
  },
  "hljs-number": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-class": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-string": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-meta-string": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-regexp": {
    color: githubLightColors.AccentRed,
  },
  "hljs-template-tag": {
    color: githubLightColors.AccentRed,
  },
  "hljs-subst": {
    color: githubLightColors.Foreground,
  },
  "hljs-function": {
    color: githubLightColors.Foreground,
  },
  "hljs-title": {
    color: githubLightColors.Foreground,
  },
  "hljs-params": {
    color: githubLightColors.Foreground,
  },
  "hljs-formula": {
    color: githubLightColors.Foreground,
  },
  "hljs-comment": {
    color: githubLightColors.Comment,
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: githubLightColors.Comment,
    fontStyle: "italic",
  },
  "hljs-doctag": {
    color: githubLightColors.Comment,
  },
  "hljs-meta": {
    color: githubLightColors.Gray,
  },
  "hljs-meta-keyword": {
    color: githubLightColors.Gray,
  },
  "hljs-tag": {
    color: githubLightColors.Gray,
  },
  "hljs-variable": {
    color: githubLightColors.AccentPurple,
  },
  "hljs-template-variable": {
    color: githubLightColors.AccentPurple,
  },
  "hljs-attr": {
    color: githubLightColors.LightBlue,
  },
  "hljs-attribute": {
    color: githubLightColors.LightBlue,
  },
  "hljs-builtin-name": {
    color: githubLightColors.LightBlue,
  },
  "hljs-section": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
  },
  "hljs-bullet": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-selector-tag": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-selector-id": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-selector-class": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-selector-attr": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-selector-pseudo": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-addition": {
    backgroundColor: githubLightColors.AccentGreen,
    display: "inline-block",
    width: "100%",
  },
  "hljs-deletion": {
    backgroundColor: githubLightColors.AccentRed,
    display: "inline-block",
    width: "100%",
  },
};

export const GitHubDark = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    background: githubDarkColors.Background,
    color: githubDarkColors.Foreground,
  },
  "hljs-keyword": {
    color: githubDarkColors.AccentBlue,
  },
  "hljs-literal": {
    color: githubDarkColors.AccentBlue,
  },
  "hljs-symbol": {
    color: githubDarkColors.AccentBlue,
  },
  "hljs-name": {
    color: githubDarkColors.AccentBlue,
  },
  "hljs-link": {
    color: githubDarkColors.AccentBlue,
    textDecoration: "underline",
  },
  "hljs-built_in": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-type": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-number": {
    color: githubDarkColors.AccentGreen,
  },
  "hljs-class": {
    color: githubDarkColors.AccentGreen,
  },
  "hljs-string": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-meta-string": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-regexp": {
    color: githubDarkColors.AccentRed,
  },
  "hljs-template-tag": {
    color: githubDarkColors.AccentRed,
  },
  "hljs-subst": {
    color: githubDarkColors.Foreground,
  },
  "hljs-function": {
    color: githubDarkColors.Foreground,
  },
  "hljs-title": {
    color: githubDarkColors.Foreground,
  },
  "hljs-params": {
    color: githubDarkColors.Foreground,
  },
  "hljs-formula": {
    color: githubDarkColors.Foreground,
  },
  "hljs-comment": {
    color: githubDarkColors.Comment,
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: githubDarkColors.Comment,
    fontStyle: "italic",
  },
  "hljs-doctag": {
    color: githubDarkColors.Comment,
  },
  "hljs-meta": {
    color: githubDarkColors.Gray,
  },
  "hljs-meta-keyword": {
    color: githubDarkColors.Gray,
  },
  "hljs-tag": {
    color: githubDarkColors.Gray,
  },
  "hljs-variable": {
    color: githubDarkColors.AccentPurple,
  },
  "hljs-template-variable": {
    color: githubDarkColors.AccentPurple,
  },
  "hljs-attr": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-attribute": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-builtin-name": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-section": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
  },
  "hljs-bullet": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-selector-tag": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-selector-id": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-selector-class": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-selector-attr": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-selector-pseudo": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-addition": {
    backgroundColor: githubDarkColors.AccentGreen,
    display: "inline-block",
    width: "100%",
  },
  "hljs-deletion": {
    backgroundColor: githubDarkColors.AccentRed,
    display: "inline-block",
    width: "100%",
  },
};

export const diffBorder = {
  light: "#dedede",
  dark: "#3d444d",
};

export const diffAddContent = {
  light: "#e6ffec",
  dark: "#14261f",
};

export const diffDelContent = {
  light: "#ffebe9",
  dark: "#311b1f",
};

export const diffAddLineNumber = {
  light: "#ccffd8",
  dark: "#1f4429",
};

export const diffDelLineNumber = {
  light: "#ffd7d5",
  dark: "#552527",
};

export const diffPlainContent = {
  light: "#ffffff",
  dark: "#0d1117",
};

export const diffExpandContent = {
  light: "#fafafa",
  dark: "#161b22",
};

export const diffPlainLineNumber = {
  light: "#fafafa",
  dark: "#161b22,",
};

export const diffExpandLineNumber = {
  light: "#fafafa",
  dark: "#161b22,",
};

export const diffPlainLineNumberColor = {
  light: "#555555",
  dark: "#a0aaab",
};

export const diffExpandLineNumberColor = {
  light: "#555555",
  dark: "#a0aaab",
};

export const diffHunkContent = {
  light: "#ddf4ff",
  dark: "#131d2e",
};

export const diffHunkLineNumber = {
  light: "#c7ecff",
  dark: "#204274",
};

export const diffAddContentHighlight = {
  light: "#abf2bc",
  dark: "#1f572d",
};

export const diffDelContentHighlight = {
  light: "#ffb3ad",
  dark: "#80312f",
};

export const diffEmptyContent = {
  light: "#fafafa",
  dark: "#161b22",
};

export const diffHunkContentColor = {
  light: "#777777",
  dark: "#9298a0",
};
