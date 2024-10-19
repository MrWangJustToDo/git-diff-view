import { useEffect, useState } from "react";

export const useTabWithRouter = () => {
  const [tab, setTab] = useState<"git" | "file">("git");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tab = query.get("tab");
    if (tab === "file") {
      setTab("file");
    } else {
      setTab("git");
    }

    const controller = new AbortController();

    window.addEventListener(
      "popstate",
      () => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("tab") === "git") {
          setTab("git");
        } else if (query.get("tab") === "file") {
          setTab("file");
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  return tab;
};
