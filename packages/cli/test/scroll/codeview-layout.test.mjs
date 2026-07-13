import {
  buildCodeViewLayout,
  buildTheme,
  getFile,
  computeScrollState,
  scrollOffsetToTopLine,
  scrollOffsetToBottomLine,
  clampScrollOffset,
} from "@git-diff-view/cli";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EMPTY,
  SINGLE_LINE,
  SHORT_LINES,
  LONG_ASCII_LINE,
  MIXED_LENGTH,
  WITH_EMPTY_LINES,
  CJK_CONTENT,
  TAB_CONTENT,
  EMOJI_CONTENT,
  MANY_LINES,
  WHITESPACE_ONLY,
  TINY_LINES,
} from "./fixtures.mjs";
import { createPlainFile, defaultCodeViewOptions } from "./helpers.mjs";

function layoutFor(content, columns = 40, options = {}) {
  const file = createPlainFile(getFile, content);
  const layout = buildCodeViewLayout(file, "light", columns, {
    ...defaultCodeViewOptions(),
    themeColors: buildTheme(),
    ...options,
  });
  return { file, layout };
}

describe("buildCodeViewLayout", () => {
  it("returns empty layout for empty file", () => {
    const { layout } = layoutFor(EMPTY);
    assert.equal(layout.totalLines, 0);
    assert.equal(layout.totalRows, 0);
    assert.deepEqual(layout.lines, []);
  });

  it("returns empty layout when columns are too narrow", () => {
    const { layout } = layoutFor(SINGLE_LINE, 4);
    assert.equal(layout.totalRows, 0);
  });

  it("renders single line as one visual row", () => {
    const { file, layout } = layoutFor("console.log('hello');");
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
    assert.equal(layout.lines[0].lineNumber, 1);
    assert.equal(layout.lines[0].startRow, 0);
    assert.equal(layout.lines[0].endRow, 1);
  });

  it("counts multiple short lines correctly", () => {
    const content = ["line 1", "line 2", "line 3", "line 4", "line 5"].join("\n");
    const { file, layout } = layoutFor(content, 60);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
    layout.lines.forEach((line, index) => {
      assert.equal(line.lineNumber, index + 1);
      assert.equal(line.endRow - line.startRow, 1);
    });
  });

  it("wraps long ASCII line into multiple visual rows", () => {
    const longLine = "const value = '" + "x".repeat(200) + "';";
    const { file, layout } = layoutFor(longLine, 30);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalLines, 1);
    assert.ok(layout.totalRows > 1, "long line should wrap");
    assert.equal(layout.lines[0].endRow - layout.lines[0].startRow, layout.totalRows);
  });

  it("assigns continuous row ranges across lines", () => {
    const { layout } = layoutFor(MIXED_LENGTH, 30);
    let expectedStart = 0;

    for (const line of layout.lines) {
      assert.equal(line.startRow, expectedStart);
      expectedStart = line.endRow;
    }

    assert.equal(expectedStart, layout.totalRows);
  });

  it("treats empty source lines as one visual row each", () => {
    const { file, layout } = layoutFor(["first", "", "", "after blanks", "last"].join("\n"), 60);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
  });

  it("wraps CJK content with wider character cells", () => {
    const narrow = layoutFor(CJK_CONTENT, 20).layout;
    const wide = layoutFor(CJK_CONTENT, 80).layout;
    assert.ok(narrow.totalRows >= wide.totalRows);
    assert.ok(narrow.totalRows > 1);
  });

  it("expands tabs when codeViewTabSpace is enabled", () => {
    const plain = layoutFor(TAB_CONTENT, 60, { tabSpace: false }).layout;
    const tabs = layoutFor(TAB_CONTENT, 60, { tabSpace: true }).layout;
    // tab expansion adds visible characters → same or more rows, longer row strings
    assert.ok(tabs.rows[0].length >= plain.rows[0].length);
  });

  it("handles emoji / wide characters without crashing", () => {
    const { file, layout } = layoutFor(EMOJI_CONTENT, 25);
    assert.ok(layout.totalLines >= 2);
    assert.equal(layout.totalLines, file.rawLength);
    assert.ok(layout.totalRows >= 2);
  });

  it("supports large files", () => {
    const { file, layout } = layoutFor(MANY_LINES, 60);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
    assert.ok(file.rawLength >= 120);
  });

  it("handles whitespace-only lines", () => {
    const { file, layout } = layoutFor(WHITESPACE_ONLY, 60);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
  });

  it("handles tiny single-char lines", () => {
    const { file, layout } = layoutFor(TINY_LINES, 60);
    assert.equal(layout.totalLines, file.rawLength);
    assert.equal(layout.totalRows, file.rawLength);
  });

  it("produces sliceable rows matching totalRows", () => {
    const { layout } = layoutFor(MIXED_LENGTH, 25);
    assert.equal(layout.rows.length, layout.totalRows);
    assert.match(layout.rows[0], /\S/);
  });
});

describe("buildCodeViewLayout + scroll state integration", () => {
  it("startLine stays on wrapped line when top segment is clipped", () => {
    const longLine = "const value = '" + "x".repeat(200) + "';";
    const { layout } = layoutFor(longLine, 25);
    assert.ok(layout.totalRows > 3);

    const state = computeScrollState(layout, 2, 3);

    assert.equal(state.startLine, 1);
    assert.equal(state.endLine, 1);
  });

  it("scrollToTop on middle line aligns to its first row", () => {
    const { layout } = layoutFor(MANY_LINES, 60);

    const targetLine = 50;
    const lineLayout = layout.lines.find((l) => l.lineNumber === targetLine);
    const offset = scrollOffsetToTopLine(layout, targetLine, 10);

    assert.equal(offset, lineLayout.startRow);
  });

  it("scrollToBottom on last line reaches max offset", () => {
    const { layout } = layoutFor(MANY_LINES, 60);

    const viewport = 10;
    const offset = scrollOffsetToBottomLine(layout, layout.totalLines, viewport);
    const maxOffset = clampScrollOffset(999, layout.totalRows, viewport);

    assert.equal(offset, maxOffset);
  });
});
