/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { useDiffConfig } from "../hooks/useDiffConfig";
import { DiffFileExtends } from "../utils";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffModeEnum, DiffViewContext } from "./DiffViewContext";

const diffFontSizeName = "--diff-font-size--";

export const DiffView = ({ data }: { data: any }) => {
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

  const diffFile = useMemo(
    () =>
      new DiffFileExtends(
        data.oldFile?.filePath || "",
        data.oldFile?.content || "",
        data.newFile?.filePath || "",
        data.newFile?.content || "",
        data.hunks.map(({ patchContent }) => patchContent)
      ),
    [data]
  );

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    console.log(diffFile);
    diffFile.init();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();
  }, [diffFile]);

  const value = useMemo(() => ({ ...option }), [option]);

  return (
    <DiffViewContext.Provider value={value}>
      <div
        id="diff-root"
        className="diff-view-wrapper text-black bg-white"
        style={{
          // @ts-ignore
          [diffFontSizeName]: option.fontSize + "px",
        }}
      >
        {option.mode === DiffModeEnum.Split ? <DiffSplitView diffFile={diffFile} /> : <DiffUnifiedView diffFile={diffFile} />}
      </div>
    </DiffViewContext.Provider>
  );
};
