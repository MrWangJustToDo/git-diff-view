import { useCallback, useState } from "@lynx-js/react";
import { highlighter as lezerHighlighter } from "@git-diff-view/lezer";
import { DiffView, DiffModeEnum, type DiffLineClickPayload } from "@git-diff-view/lynx";
import "@git-diff-view/lynx/styles/diff-view.css";
import "./style.css";

import { b as SAMPLE } from "./data";

export function App() {
  const [mode, setMode] = useState(DiffModeEnum.Split);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highlight, setHighlight] = useState(true);
  const [wrap, setWrap] = useState(true);
  const [lastClick, setLastClick] = useState("");

  const onDiffLineClick = useCallback((payload: DiffLineClickPayload) => {
    const parts = [
      payload.type,
      `seq=${payload.lineNumber}`,
      payload.side != null ? `side=${payload.side}` : null,
      payload.oldLineNumber != null ? `old=${payload.oldLineNumber}` : null,
      payload.newLineNumber != null ? `new=${payload.newLineNumber}` : null,
    ].filter(Boolean);
    setLastClick(parts.join(" "));
  }, []);

  const isSplit = !!(mode & DiffModeEnum.Split);

  return (
    <view className="flex h-full w-full flex-col" style={{ backgroundColor: theme === "dark" ? "#0d1117" : "#fff" }}>
      <view className="flex flex-row flex-wrap p-[8px]">
        <view
          bindtap={() => setMode(isSplit ? DiffModeEnum.Unified : DiffModeEnum.Split)}
          className="mr-[8px] mb-[4px] px-[10px] py-[6px]"
          style={{ backgroundColor: "#0969da" }}
        >
          <text style={{ color: "#fff" }}>{isSplit ? "Split" : "Unified"}</text>
        </view>
        <view
          bindtap={() => setTheme(theme === "light" ? "dark" : "light")}
          className="mr-[8px] mb-[4px] px-[10px] py-[6px]"
          style={{ backgroundColor: "#6e7781" }}
        >
          <text style={{ color: "#fff" }}>{theme}</text>
        </view>
        <view
          bindtap={() => setHighlight((v) => !v)}
          className="mr-[8px] mb-[4px] px-[10px] py-[6px]"
          style={{ backgroundColor: "#1a7f37" }}
        >
          <text style={{ color: "#fff" }}>hl:{highlight ? "lezer" : "off"}</text>
        </view>
        <view
          bindtap={() => setWrap((v) => !v)}
          className="mb-[4px] px-[10px] py-[6px]"
          style={{ backgroundColor: isSplit ? "#8c959f" : "#8250df" }}
        >
          <text style={{ color: "#fff" }}>
            wrap:{wrap ? "on" : "off"}
            {isSplit ? " (Split always)" : ""}
          </text>
        </view>
      </view>
      {lastClick ? (
        <view className="px-[8px] pb-[4px]">
          <text style={{ color: theme === "dark" ? "#a0aaab" : "#555", fontSize: "12px" }}>click: {lastClick}</text>
        </view>
      ) : null}
      <view
        className="min-h-0 flex-1 flex flex-col m-4 border border-gray-200 rounded-md overflow-hidden"
        style={{ flexBasis: "0%" }}
      >
        <DiffView
          data={{
            oldFile: {
              fileName: SAMPLE.newFile?.fileName || "feature.ts",
              fileLang: "typescript",
              content: undefined,
            },
            newFile: {
              fileName: SAMPLE.newFile?.fileName || "feature.ts",
              fileLang: "typescript",
              content: SAMPLE.newFile?.content || "",
            },
            hunks: SAMPLE.hunks,
          }}
          diffViewMode={mode}
          diffViewTheme={theme}
          diffViewHighlight={highlight}
          registerHighlighter={lezerHighlighter}
          diffViewWrap={wrap}
          onDiffLineClick={onDiffLineClick}
          extendData={{
            newFile: {
              "77": { data: "extend: reactiveEffect.stop()" },
            },
          }}
          renderExtendLine={({ data }) => (
            <view
              className="w-full px-[10px] py-[6px]"
              style={{ backgroundColor: theme === "dark" ? "#204274" : "#ddf4ff" }}
            >
              <text style={{ color: theme === "dark" ? "#e6edf3" : "#24292e" }}>{String(data)}</text>
            </view>
          )}
          style={{ height: "100%" }}
        />
      </view>
    </view>
  );
}
