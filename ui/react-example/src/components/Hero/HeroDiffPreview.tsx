import { generateDiffFile } from "@git-diff-view/file";
import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import { useMemo } from "react";

const wideOld = `import { DiffView } from "@git-diff-view/react";

export const Review = ({ file }) => {
  const [mode, setMode] = useState(DiffModeEnum.Split);

  return (
    <DiffView
      diffFile={file}
      diffViewMode={mode}
      diffViewHighlight
    />
  );
};
`;

const wideNew = `import { DiffView } from "@git-diff-view/react";

export const Review = ({ file }) => {
  const [mode, setMode] = useState(DiffModeEnum.Split);
  const [wrap, setWrap] = useState(true);

  return (
    <DiffView
      diffFile={file}
      diffViewMode={mode}
      diffViewWrap={wrap}
      diffViewHighlight
    />
  );
};
`;

/** Phones get their own sample: short lines, so nothing breaks mid-token. */
const compactOld = `export const Review = ({ file }) => {
  const [mode, setMode] =
    useState(Split);

  return (
    <DiffView
      file={file}
      mode={mode}
    />
  );
};
`;

const compactNew = `export const Review = ({ file }) => {
  const [mode, setMode] =
    useState(Split);
  const [wrap, setWrap] =
    useState(true);

  return (
    <DiffView
      file={file}
      mode={mode}
      wrap={wrap}
    />
  );
};
`;

const wideFile = generateDiffFile("Review.tsx", wideOld, "Review.tsx", wideNew, "tsx", "tsx");
wideFile.initRaw();

const compactFile = generateDiffFile("Review.tsx", compactOld, "Review.tsx", compactNew, "tsx", "tsx");
compactFile.initRaw();

export const heroDiffStat = {
  wide: { additions: wideFile.additionLength, deletions: wideFile.deletionLength },
  compact: { additions: compactFile.additionLength, deletions: compactFile.deletionLength },
};

interface HeroDiffPreviewProps {
  compact?: boolean;
}

export const HeroDiffPreview = ({ compact = false }: HeroDiffPreviewProps) => {
  const diffFile = useMemo(() => (compact ? compactFile : wideFile), [compact]);

  return (
    <DiffView
      diffFile={diffFile}
      diffViewTheme="dark"
      diffViewHighlight
      diffViewMode={compact ? DiffModeEnum.Unified : DiffModeEnum.Split}
      diffViewFontSize={compact ? 11.5 : 13.5}
    />
  );
};
