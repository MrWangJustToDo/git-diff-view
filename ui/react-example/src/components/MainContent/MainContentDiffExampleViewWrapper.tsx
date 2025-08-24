import diffStyle from "@git-diff-view/react/styles/diff-view-pure.css?inline";
import { MantineProvider } from "@mantine/core";
import mantineStyle from "@mantine/core/styles.css?inline";
import overlayscrollbarsStyle from "overlayscrollbars/overlayscrollbars.css?inline";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { useDiffConfig } from "../../hooks/useDiffConfig";
import styles from "../../index.css?inline";
import { theme } from "../../theme";

import { MainContentDiffExampleView } from "./MainContentDiffExampleView";

import type { DiffFile, DiffViewProps } from "@git-diff-view/react";
import type { Root } from "react-dom/client";

export const MainContentDiffExampleViewWrapper = ({
  diffFile,
  highlighter,
  refreshDiffFile,
}: {
  diffFile: DiffFile;
  highlighter?: DiffViewProps<string[]>["registerHighlighter"];
  refreshDiffFile: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [root, setRoot] = useState<Root>();

  const shadow = useDiffConfig((s) => s.shadowDOM);

  useEffect(() => {
    if (shadow) {
      const shadowRoot = ref.current?.shadowRoot || ref.current?.attachShadow({ mode: "open" });
      if (shadowRoot) {
        const reactRoot = createRoot(shadowRoot);
        setRoot(reactRoot);
      }
    }
  }, [shadow]);

  useEffect(() => {
    if (root) {
      root.render(
        <>
          <style>{styles}</style>
          <style>{mantineStyle}</style>
          <style>{overlayscrollbarsStyle}</style>
          <style>{diffStyle}</style>
          <MantineProvider theme={theme}>
            <MainContentDiffExampleView
              diffFile={diffFile}
              highlighter={highlighter}
              refreshDiffFile={refreshDiffFile}
            />
          </MantineProvider>
        </>
      );
    }
  }, [root, diffFile, highlighter, refreshDiffFile]);

  useEffect(() => {
    return () => {
      if (root) {
        root.unmount();
      }
    };
  }, [root]);

  if (shadow) {
    return <div ref={ref} className="h-full overflow-auto" />;
  } else {
    return (
      <MainContentDiffExampleView diffFile={diffFile} highlighter={highlighter} refreshDiffFile={refreshDiffFile} />
    );
  }
};
