import { createState } from "reactivity-store";

export const useColorMode = createState(() => ({ theme: "light" }) as { theme: "light" | "dark" }, {
  withActions: (s) => ({
    toggle: () => {
      s.theme = s.theme === "light" ? "dark" : "light";
    },
  }),
  withPersist: "useColorMode",
});
