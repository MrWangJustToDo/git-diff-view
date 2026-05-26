import { MainContentDiffExampleView } from "./MainContentDiffExampleView";

import type { DiffFile, DiffViewProps } from "@git-diff-view/react";

export const MainContentDiffExampleViewWrapper = ({
  diffFile,
  highlighter,
  refreshDiffFile,
}: {
  diffFile: DiffFile;
  highlighter?: DiffViewProps<string[]>["registerHighlighter"];
  refreshDiffFile: () => void;
}) => {
  return <MainContentDiffExampleView diffFile={diffFile} highlighter={highlighter} refreshDiffFile={refreshDiffFile} />;
};
