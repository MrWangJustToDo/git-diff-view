import { useEffect } from "react";
import { createState } from "reactivity-store";

export const usePreviewType = createState(() => ({ type: "example" as "example" | "try" }), {
  withActions: (s) => ({ set: (type: "example" | "try") => (s.type = type) }),
  withNamespace: "usePreviewType",
  withPersist: "usePreviewType",
});

const { set: setType } = usePreviewType.getActions();

export const usePreviewTypeWithRouter = () => {
  const type = usePreviewType((s) => s.type);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("type") === "example") {
      setType("example");
    } else if (query.get("type") === "try") {
      setType("try");
    }
  }, []);

  return type;
};
