/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { DiffFileData, parseDiffFile } from "../diff";
import { useDiffConfig } from "../hooks/useDiffConfig";
import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import "highlight.js/styles/github.css";
import {
  addContentBG,
  addContentBGName,
  addContentHighlightBG,
  addContentHighlightBGName,
  addLineNumberBG,
  addLineNumberBGName,
  addWidgetBG,
  addWidgetBGName,
  addWidgetColor,
  addWidgetColorName,
  delContentBG,
  delContentBGName,
  delContentHighlightBG,
  delContentHighlightBGName,
  delLineNumberBG,
  delLineNumberBGName,
  emptyBG,
  emptyBGName,
  expandContentBG,
  expandContentBGName,
  hunkContentBG,
  hunkContentBGName,
  hunkLineNumberBG,
  hunkLineNumberBGName,
  plainContentBG,
  plainContentBGName,
  plainLineNumberBG,
  plainLineNumberBGName,
  plainLineNumberColor,
  plainLineNumberColorName,
} from "./color";
import { DiffModeEnum, DiffViewContext } from "./DiffViewContext";

const diffFontSizeName = "--diff-font-size--";

export const DiffView = ({ data }: { data: DiffFileData }) => {
  const option = useDiffConfig(
    useCallback(
      (s) => ({
        mode: s.mode,
        isHighlight: s.highlight,
        fontSize: s.fontsize,
        isWrap: s.wrap,
      }),
      []
    )
  );

  const [oldList, setOldList] = useState<Record<number, ReactNode[]>>({});

  const [newList, setNewList] = useState<Record<number, ReactNode[]>>({});

  const diffFile = useMemo(() => parseDiffFile(data), [data]);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    diffFile.init();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();
  }, [diffFile]);

  const value = useMemo(
    () => ({ ...option, oldList, newList }),
    [option, oldList, newList]
  );

  return (
    <DiffViewContext.Provider value={value}>
      <div
        className="diff-view-wrapper text-black bg-white"
        style={{
          // @ts-ignore
          [emptyBGName]: emptyBG,
          [addWidgetBGName]: addWidgetBG,
          [addContentBGName]: addContentBG,
          [delContentBGName]: delContentBG,
          [hunkContentBGName]: hunkContentBG,
          [plainContentBGName]: plainContentBG,
          [expandContentBGName]: expandContentBG,
          [addWidgetColorName]: addWidgetColor,
          [addLineNumberBGName]: addLineNumberBG,
          [delLineNumberBGName]: delLineNumberBG,
          [hunkLineNumberBGName]: hunkLineNumberBG,
          [plainLineNumberBGName]: plainLineNumberBG,
          [plainLineNumberColorName]: plainLineNumberColor,
          [addContentHighlightBGName]: addContentHighlightBG,
          [delContentHighlightBGName]: delContentHighlightBG,
          [diffFontSizeName]: option.fontSize + "px",
        }}
      >
        {option.mode === DiffModeEnum.Split ? (
          <DiffSplitView diffFile={diffFile} />
        ) : (
          <DiffUnifiedView diffFile={diffFile} />
        )}
      </div>
    </DiffViewContext.Provider>
  );
};
