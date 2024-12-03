import { getDiffViewHighlighter } from "@git-diff-view/shiki";
import { useEffect, useState } from "react";

import type { DiffHighlighter } from "@git-diff-view/react";
import type { Dispatch, SetStateAction } from "react";

export const useDiffHighlighter = ({ setLoading }: { setLoading: Dispatch<SetStateAction<boolean>> }) => {
  const [highlighter, setHighlighter] = useState<Omit<DiffHighlighter, "getHighlighterEngine">>();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const shikiHighlighter = await getDiffViewHighlighter();
        if (shikiHighlighter) {
          setHighlighter(shikiHighlighter);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return highlighter;
};
