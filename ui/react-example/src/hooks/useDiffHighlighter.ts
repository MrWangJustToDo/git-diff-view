import { getDiffViewHighlighter } from "@git-diff-view/shiki";
import { useEffect, useState } from "react";

import type { DiffHighlighter } from "@git-diff-view/react";
import type { Dispatch, SetStateAction } from "react";

export const useDiffHighlighter = (props?: { setLoading: Dispatch<SetStateAction<boolean>> }) => {
  const [highlighter, setHighlighter] = useState<Omit<DiffHighlighter, "getHighlighterEngine">>();

  useEffect(() => {
    const init = async () => {
      props?.setLoading?.(true);
      try {
        const shikiHighlighter = await getDiffViewHighlighter();
        if (shikiHighlighter) {
          setHighlighter(shikiHighlighter);
        }
      } finally {
        props?.setLoading?.(false);
      }
    };
    init();
  }, []);

  return highlighter;
};
