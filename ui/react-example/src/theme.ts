import { createTheme } from "@mantine/core";

/**
 * The landing page uses a deep green as its single accent, so register a
 * matching 10-shade ramp (Mantine rejects a `primaryColor` that is not in
 * `theme.colors`) and pick a different shade per colour scheme.
 */
const accent = [
  "#ecfdf5",
  "#d1fae5",
  "#a7f3d0",
  "#6ee7b7",
  "#34d399",
  "#10b981",
  "#059669",
  "#047857",
  "#065f46",
  "#064e3b",
] as const;

export const theme = createTheme({
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, Fira Code, Monaco, Consolas, Courier New, monospace",
  primaryColor: "accent",
  primaryShade: { light: 7, dark: 4 },
  colors: { accent: [...accent] },
  defaultRadius: "sm",
  headings: {
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "2.75rem", lineHeight: "1.15" },
      h2: { fontSize: "1.75rem", lineHeight: "1.25" },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
    Card: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
});
