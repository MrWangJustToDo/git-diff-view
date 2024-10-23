import { useEffect } from "react";
import { createState } from "reactivity-store";

export const usePreviewType = createState(() => ({ type: "main" as "main" | "example" | "try" }), {
  withActions: (s) => ({ set: (type: "main" | "example" | "try") => (s.type = type) }),
  withNamespace: "usePreviewType",
  // withPersist: "usePreviewType",
});

const { set: setType } = usePreviewType.getActions();

export const usePreviewTypeWithRouter = () => {
  const type = usePreviewType((s) => s.type);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const type = query.get("type");
    if (!type) return;
    if (type === "example") {
      setType("example");
    } else if (type === "try") {
      setType("try");
    } else {
      setType("main");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "popstate",
      () => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("type") === "example") {
          setType("example");
        } else if (query.get("type") === "try") {
          setType("try");
        } else {
          setType("main");
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  return type;
};
