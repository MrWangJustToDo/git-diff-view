import { createState } from "reactivity-store";

export const usePreviewType = createState(() => ({ type: "example" as "example" | "try" }), {
  withActions: (s) => ({ set: (type: "example" | "try") => (s.type = type) }),
  withNamespace: "usePreviewType",
  withPersist: "usePreviewType",
});
