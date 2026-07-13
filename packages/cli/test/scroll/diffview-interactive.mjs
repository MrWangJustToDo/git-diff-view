/**
 * Interactive DiffView scroll demo.
 *
 * Run:  pnpm --filter @git-diff-view/cli test:scroll:interactive:diffview
 *
 * Keys:
 *   j / k       scroll down / up (visual row)
 *   d / u       scroll down / up (logical display line)
 *   g / G       scroll to top / bottom of sequence
 *   t / b       scrollToTop / scrollToBottom for jump target line
 *   + / -       increase / decrease jump target line
 *   s / U       split / unified mode
 *   q           quit
 */
import { DiffView, DiffModeEnum } from "@git-diff-view/cli";
import { generateDiffFile } from "@git-diff-view/file";
import { Box, Text, useApp, useInput, render } from "ink";
import { createElement, useCallback, useMemo, useRef, useState } from "react";

import { DIFF_NEW_CONTENT, DIFF_OLD_CONTENT } from "./diff-fixtures.mjs";

const VIEWPORT_HEIGHT = 14;
const WIDTH = 88;

function createInteractiveDiffFile() {
  const diffFile = generateDiffFile(
    "demo.ts",
    DIFF_OLD_CONTENT,
    "demo.ts",
    DIFF_NEW_CONTENT,
    "typescript",
    "typescript"
  );
  diffFile.initTheme("dark");
  diffFile.initRaw();
  diffFile.buildSplitDiffLines();
  diffFile.buildUnifiedDiffLines();
  return diffFile;
}

function findExtendLineNumber(diffFile) {
  const lines = DIFF_NEW_CONTENT.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("extend line target")) {
      return i + 1;
    }
  }
  return 1;
}

function ScrollDemo() {
  const ref = useRef(null);
  const { exit } = useApp();
  const [state, setState] = useState(null);
  const [jumpLine, setJumpLine] = useState(8);
  const [log, setLog] = useState("Ready.");
  const [mode, setMode] = useState(DiffModeEnum.Unified);

  const diffFile = useMemo(() => createInteractiveDiffFile(), []);
  const extendLineNumber = useMemo(() => findExtendLineNumber(diffFile), [diffFile]);

  const pushLog = useCallback((message) => {
    setLog(message);
  }, []);

  useInput((input, key) => {
    const api = ref.current;

    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (input === "s") {
      setMode(DiffModeEnum.Split);
      pushLog("mode: Split");
      return;
    }
    if (input === "U") {
      setMode(DiffModeEnum.Unified);
      pushLog("mode: Unified");
      return;
    }

    if (!api) return;

    if (input === "j") {
      api.scrollDown({ unit: "visual" });
      pushLog("scrollDown(visual)");
      return;
    }
    if (input === "k") {
      api.scrollUp({ unit: "visual" });
      pushLog("scrollUp(visual)");
      return;
    }
    if (input === "d") {
      api.scrollDown({ unit: "logical" });
      pushLog("scrollDown(logical)");
      return;
    }
    if (input === "u") {
      api.scrollUp({ unit: "logical" });
      pushLog("scrollUp(logical)");
      return;
    }
    if (input === "g") {
      api.scrollToTop(1);
      pushLog("scrollToTop(1)");
      return;
    }
    if (input === "G") {
      const total = api.getScrollState().totalLines;
      api.scrollToBottom(total);
      pushLog(`scrollToBottom(${total})`);
      return;
    }
    if (input === "t") {
      api.scrollToTop(jumpLine);
      pushLog(`scrollToTop(${jumpLine})`);
      return;
    }
    if (input === "b") {
      api.scrollToBottom(jumpLine);
      pushLog(`scrollToBottom(${jumpLine})`);
      return;
    }
    if (input === "+") {
      setJumpLine((line) => line + 1);
      return;
    }
    if (input === "-") {
      setJumpLine((line) => Math.max(1, line - 1));
    }
  });

  const modeLabel = mode & DiffModeEnum.Split ? "Split" : "Unified";

  const snapshot = state
    ? `seq ${state.startLine}-${state.endLine} / ${state.totalLines} | rows ${state.scrollOffset}/${state.totalRows} | ↑${state.canScrollUp ? "Y" : "N"} ↓${state.canScrollDown ? "Y" : "N"} | ${modeLabel}`
    : "waiting for scroll state…";

  return createElement(
    Box,
    { flexDirection: "column" },
    createElement(Text, { bold: true, color: "cyan" }, "DiffView Scroll Interactive Test"),
    createElement(Text, { dimColor: true }, snapshot),
    createElement(Text, { dimColor: true }, `jump seq line: ${jumpLine} (t/b) | last: ${log}`),
    createElement(DiffView, {
      ref,
      key: modeLabel,
      diffFile,
      // width: WIDTH,
      height: VIEWPORT_HEIGHT,
      diffViewTheme: "dark",
      diffViewMode: mode,
      diffViewHighlight: true,
      diffViewExtendLineHeight: 2,
      extendData: {
        newFile: {
          [extendLineNumber]: { data: `extend @ new line ${extendLineNumber}` },
        },
      },
      renderExtendLine: ({ data, side, lineNumber }) =>
        createElement(
          Box,
          { paddingX: 1 },
          createElement(Text, { color: "yellow", dimColor: true }, `[${side} L${lineNumber}] ${String(data)}`)
        ),
      onScrollChange: setState,
    }),
    createElement(
      Text,
      { dimColor: true },
      "j/k visual | d/u logical | g/G seq ends | t/b jump | +/- target | s/U mode | q quit"
    )
  );
}

render(createElement(ScrollDemo));
