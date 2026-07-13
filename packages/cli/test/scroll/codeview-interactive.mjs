/**
 * Interactive CodeView scroll demo.
 *
 * Run:  pnpm --filter @git-diff-view/cli test:scroll:interactive
 *
 * Keys:
 *   j / k       scroll down / up (visual row)
 *   d / u       scroll down / up (logical line)
 *   g / G       scroll to top / bottom of file
 *   t / b       scrollToTop / scrollToBottom for jump target line
 *   + / -       increase / decrease jump target line
 *   q           quit
 */
import { CodeView } from "@git-diff-view/cli";
import { Box, Text, useApp, useInput, render } from "ink";
import { createElement, useCallback, useRef, useState } from "react";

import { INTERACTIVE_CONTENT } from "./fixtures.mjs";

const VIEWPORT_HEIGHT = 12;
const WIDTH = 72;

function ScrollDemo() {
  const ref = useRef(null);
  const { exit } = useApp();
  const [state, setState] = useState(null);
  const [jumpLine, setJumpLine] = useState(20);
  const [log, setLog] = useState("Ready.");

  const pushLog = useCallback((message) => {
    setLog(message);
  }, []);

  useInput((input, key) => {
    const api = ref.current;
    if (!api) return;

    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

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

  const snapshot = state
    ? `lines ${state.startLine}-${state.endLine} / ${state.totalLines} | rows offset ${state.scrollOffset} / ${state.totalRows} | ↑${state.canScrollUp ? "Y" : "N"} ↓${state.canScrollDown ? "Y" : "N"}`
    : "waiting for scroll state…";

  return createElement(
    Box,
    { flexDirection: "column" },
    createElement(Text, { bold: true, color: "cyan" }, "CodeView Scroll Interactive Test"),
    createElement(Text, { dimColor: true }, snapshot),
    createElement(Text, { dimColor: true }, `jump line: ${jumpLine} (t/b) | last: ${log}`),
    createElement(CodeView, {
      ref,
      width: WIDTH,
      height: VIEWPORT_HEIGHT,
      codeViewHighlight: true,
      codeViewTheme: "dark",
      // codeViewNoBG: true,
      data: { content: INTERACTIVE_CONTENT, fileLang: "typescript", fileName: "demo.ts" },
      onScrollChange: setState,
    }),
    createElement(
      Text,
      { dimColor: true },
      "j/k visual | d/u logical | g/G file top/bottom | t/b jump line | +/- jump target | q quit"
    )
  );
}

render(createElement(ScrollDemo));
