'use client'

// all of export from `@git-diff-view/react` is client component
import { DiffFile, DiffView } from "@git-diff-view/react";
import { useMemo } from "react";

export const View = ({data}: {data: ReturnType<DiffFile['getBundle']>}) => {

  const diffFile = useMemo(() => DiffFile.createInstance({}, data), [data]);

  return <DiffView diffFile={diffFile} diffViewHighlight diffViewWrap diffViewFontSize={14} />;
}