import { useEffect } from "react";
import { createState } from "reactivity-store";

type PreviewType = "main" | "example" | "try" | "worker" | "multiselect";

export const usePreviewType = createState(() => ({ type: "main" as PreviewType }), {
  withActions: (s) => ({ set: (type: PreviewType) => (s.type = type) }),
  withNamespace: "usePreviewType",
});

const { set: setType } = usePreviewType.getActions();

const parseType = (type: string | null): PreviewType => {
  if (type === "example") return "example";
  if (type === "try") return "try";
  if (type === "worker") return "worker";
  if (type === "multiselect") return "multiselect";
  return "main";
};

export const usePreviewTypeWithRouter = () => {
  const type = usePreviewType((s) => s.type);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const type = query.get("type");
    if (!type) return;
    setType(parseType(type));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "popstate",
      () => {
        const query = new URLSearchParams(window.location.search);
        setType(parseType(query.get("type")));
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  return type;
};
