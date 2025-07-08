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
  Comment: "#6A737D",
  Gray: "#6A737D",
  GradientColors: ["#79B8FF", "#85E89D"],
} as const;

export const GitHubLight = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    color: githubLightColors.Foreground,
    background: githubLightColors.Background,
  },
  "hljs-comment": {
    color: githubLightColors.Comment,
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: githubLightColors.Comment,
    fontStyle: "italic",
  },
  "hljs-keyword": {
    color: githubLightColors.Foreground,
    fontWeight: "bold",
  },
  "hljs-selector-tag": {
    color: githubLightColors.Foreground,
    fontWeight: "bold",
  },
  "hljs-subst": {
    color: githubLightColors.Foreground,
    fontWeight: "normal",
  },
  "hljs-number": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-literal": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-variable": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-template-variable": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-tag .hljs-attr": {
    color: githubLightColors.AccentGreen,
  },
  "hljs-string": {
    color: githubLightColors.AccentRed,
  },
  "hljs-doctag": {
    color: githubLightColors.AccentRed,
  },
  "hljs-title": {
    color: githubLightColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-section": {
    color: githubLightColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-selector-id": {
    color: githubLightColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-type": {
    color: githubLightColors.AccentBlue,
    fontWeight: "bold",
  },
  "hljs-class .hljs-title": {
    color: githubLightColors.AccentBlue,
    fontWeight: "bold",
  },
  "hljs-tag": {
    color: githubLightColors.AccentBlue,
    fontWeight: "normal",
  },
  "hljs-name": {
    color: githubLightColors.AccentBlue,
    fontWeight: "normal",
  },
  "hljs-attribute": {
    color: githubLightColors.AccentBlue,
    fontWeight: "normal",
  },
  "hljs-regexp": {
    color: githubLightColors.AccentCyan,
  },
  "hljs-link": {
    color: githubLightColors.AccentCyan,
  },
  "hljs-symbol": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-bullet": {
    color: githubLightColors.AccentYellow,
  },
  "hljs-built_in": {
    color: githubLightColors.LightBlue,
  },
  "hljs-builtin-name": {
    color: githubLightColors.LightBlue,
  },
  "hljs-meta": {
    color: githubLightColors.Gray,
    fontWeight: "bold",
  },
  "hljs-deletion": {
    background: "#fdd",
  },
  "hljs-addition": {
    background: "#dfd",
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
  },
};

export const GitHubDark = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    color: githubDarkColors.Foreground,
    background: githubDarkColors.Background,
  },
  "hljs-comment": {
    color: githubDarkColors.Comment,
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: githubDarkColors.Comment,
    fontStyle: "italic",
  },
  "hljs-keyword": {
    color: githubDarkColors.AccentRed,
    fontWeight: "bold",
  },
  "hljs-selector-tag": {
    color: githubDarkColors.AccentRed,
    fontWeight: "bold",
  },
  "hljs-subst": {
    color: githubDarkColors.Foreground,
  },
  "hljs-number": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-literal": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-variable": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-template-variable": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-tag .hljs-attr": {
    color: githubDarkColors.AccentYellow,
  },
  "hljs-string": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-doctag": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-title": {
    color: githubDarkColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-section": {
    color: githubDarkColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-selector-id": {
    color: githubDarkColors.AccentPurple,
    fontWeight: "bold",
  },
  "hljs-type": {
    color: githubDarkColors.AccentGreen,
    fontWeight: "bold",
  },
  "hljs-class .hljs-title": {
    color: githubDarkColors.AccentGreen,
    fontWeight: "bold",
  },
  "hljs-tag": {
    color: githubDarkColors.AccentGreen,
  },
  "hljs-name": {
    color: githubDarkColors.AccentGreen,
  },
  "hljs-attribute": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-regexp": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-link": {
    color: githubDarkColors.AccentCyan,
  },
  "hljs-symbol": {
    color: githubDarkColors.AccentPurple,
  },
  "hljs-bullet": {
    color: githubDarkColors.AccentPurple,
  },
  "hljs-built_in": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-builtin-name": {
    color: githubDarkColors.LightBlue,
  },
  "hljs-meta": {
    color: githubDarkColors.LightBlue,
    fontWeight: "bold",
  },
  "hljs-deletion": {
    background: "#86181D",
    color: githubDarkColors.AccentRed,
  },
  "hljs-addition": {
    background: "#144620",
    color: githubDarkColors.AccentGreen,
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
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
  light: '#c7ecff',
  dark: '#204274',
}

export const diffAddContentHighlight = {
  light: '#abf2bc',
  dark: '#1f572d'
}

export const diffDelContentHighlight = {
  light: '#ffb3ad',
  dark: '#80312f'
}

export const diffEmptyContent = {
  light: "#fafafa",
  dark: "#161b22",
}

export const diffHunkContentColor = {
  light: "#777777",
  dark: "#9298a0",
}
