import { createTheme } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, Fira Code, Monaco, Consolas, Courier New, monospace",
  primaryColor: "indigo",
  defaultRadius: "md",
  headings: {
    fontWeight: "800",
    sizes: {
      h1: { fontSize: "2.75rem", lineHeight: "1.15" },
      h2: { fontSize: "1.75rem", lineHeight: "1.25" },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});
