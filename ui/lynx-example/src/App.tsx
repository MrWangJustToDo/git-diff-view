import { useState } from "@lynx-js/react";
import { highlighter as lezerHighlighter } from "@git-diff-view/lezer";
import { DiffView, DiffModeEnum } from "@git-diff-view/lynx";
import "../../../packages/lynx/src/tailwind.css";

import { b as SAMPLE } from "./data";

export function App() {
  const [mode, setMode] = useState(DiffModeEnum.Split);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highlight, setHighlight] = useState(true);

  return (
    <view className="flex h-full w-full flex-col" style={{ backgroundColor: theme === "dark" ? "#0d1117" : "#fff" }}>
      <view className="flex flex-row p-[8px]">
        <view
          bindtap={() => setMode(mode & DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split)}
          className="mr-[8px] px-[10px] py-[6px]"
          style={{ backgroundColor: "#0969da" }}
        >
          <text style={{ color: "#fff" }}>{mode & DiffModeEnum.Split ? "Split" : "Unified"}</text>
        </view>
        <view
          bindtap={() => setTheme(theme === "light" ? "dark" : "light")}
          className="mr-[8px] px-[10px] py-[6px]"
          style={{ backgroundColor: "#6e7781" }}
        >
          <text style={{ color: "#fff" }}>{theme}</text>
        </view>
        <view bindtap={() => setHighlight((v) => !v)} className="px-[10px] py-[6px]" style={{ backgroundColor: "#1a7f37" }}>
          <text style={{ color: "#fff" }}>hl:{highlight ? "lezer" : "off"}</text>
        </view>
      </view>
      <view className="min-h-0 flex-1 flex flex-col m-4 border border-gray-200 rounded-md overflow-hidden" style={{ flexBasis: "0%" }}>
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
          diffViewWrap
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
