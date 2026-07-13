import {
  clampScrollOffset,
  clampLineNumber,
  computeScrollState,
  scrollOffsetToTopLine,
  scrollOffsetToBottomLine,
  scrollOffsetUp,
  scrollOffsetDown,
  sliceVisibleRows,
  EMPTY_SCROLL_LAYOUT,
} from "@git-diff-view/cli";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { makeScrollLayout } from "./helpers.mjs";

describe("scroll pure functions", () => {
  describe("clampScrollOffset", () => {
    it("clamps to [0, totalRows - viewportHeight]", () => {
      assert.equal(clampScrollOffset(-5, 20, 5), 0);
      assert.equal(clampScrollOffset(100, 20, 5), 15);
      assert.equal(clampScrollOffset(7, 20, 5), 7);
    });

    it("allows offset 0 when content fits viewport", () => {
      assert.equal(clampScrollOffset(5, 3, 10), 0);
    });
  });

  describe("clampLineNumber", () => {
    it("clamps to valid range", () => {
      assert.equal(clampLineNumber(0, 10), 1);
      assert.equal(clampLineNumber(99, 10), 10);
      assert.equal(clampLineNumber(5, 10), 5);
    });

    it("returns 1 for empty file", () => {
      assert.equal(clampLineNumber(5, 0), 1);
    });
  });

  describe("computeScrollState — empty layout", () => {
    it("returns zero state", () => {
      const state = computeScrollState(EMPTY_SCROLL_LAYOUT, 0, 5);
      assert.deepEqual(state, {
        totalLines: 0,
        totalRows: 0,
        viewportHeight: 5,
        scrollOffset: 0,
        startLine: 0,
        endLine: 0,
        canScrollUp: false,
        canScrollDown: false,
      });
    });
  });

  describe("computeScrollState — no scrolling needed", () => {
    it("disables scroll when viewport >= totalRows", () => {
      const layout = makeScrollLayout([1, 1, 2]);
      const state = computeScrollState(layout, 0, 10);

      assert.equal(state.totalLines, 3);
      assert.equal(state.totalRows, 4);
      assert.equal(state.startLine, 1);
      assert.equal(state.endLine, 3);
      assert.equal(state.canScrollUp, false);
      assert.equal(state.canScrollDown, false);
    });
  });

  describe("computeScrollState — partial line at viewport top", () => {
    it("keeps clipped line as startLine", () => {
      // line 1: 3 rows, line 2: 1 row, line 3: 1 row → total 5 rows
      const layout = makeScrollLayout([3, 1, 1]);
      // viewport height 2, offset 1 → visible rows R1,R2 of line 1
      const state = computeScrollState(layout, 1, 2);

      assert.equal(state.startLine, 1);
      assert.equal(state.endLine, 1);
      assert.equal(state.scrollOffset, 1);
    });

    it("keeps clipped line as endLine when bottom segment is partial", () => {
      const layout = makeScrollLayout([1, 3, 1]);
      // offset 2, height 2 → rows R1,R2 of line 2 (line 2 partially visible at bottom)
      const state = computeScrollState(layout, 2, 2);

      assert.equal(state.startLine, 2);
      assert.equal(state.endLine, 2);
    });
  });

  describe("computeScrollState — spanning multiple logical lines", () => {
    it("reports correct startLine and endLine", () => {
      const layout = makeScrollLayout([1, 1, 1, 1, 1]);
      const state = computeScrollState(layout, 1, 3);

      assert.equal(state.startLine, 2);
      assert.equal(state.endLine, 4);
      assert.equal(state.canScrollUp, true);
      assert.equal(state.canScrollDown, true);
    });
  });

  describe("scrollOffsetToTopLine", () => {
    it("aligns first visual row of target line", () => {
      const layout = makeScrollLayout([1, 4, 1]);
      assert.equal(scrollOffsetToTopLine(layout, 2, 3), 1);
    });

    it("clamps out-of-range line numbers", () => {
      const layout = makeScrollLayout([1, 1, 1]);
      assert.equal(scrollOffsetToTopLine(layout, 999, 2), scrollOffsetToTopLine(layout, 3, 2));
      assert.equal(scrollOffsetToTopLine(layout, 0, 2), 0);
    });
  });

  describe("scrollOffsetToBottomLine", () => {
    it("aligns last visual row of target line to viewport bottom", () => {
      const layout = makeScrollLayout([1, 5, 1]); // rows: L1, L2x5, L3 → total 7
      // line 2 ends at row index 5 (exclusive endRow=6), last row index = 5
      // offset = endRow - viewport = 6 - 3 = 3
      assert.equal(scrollOffsetToBottomLine(layout, 2, 3), 3);
    });

    it("handles line taller than viewport", () => {
      const layout = makeScrollLayout([8]);
      const offset = scrollOffsetToBottomLine(layout, 1, 3);
      // endRow=8, offset = 8-3 = 5 → shows rows 5,6,7 (last 3 of line 1)
      assert.equal(offset, 5);
    });
  });

  describe("scrollOffsetUp / scrollOffsetDown — visual unit", () => {
    it("moves by visual rows", () => {
      const layout = makeScrollLayout([1, 1, 1, 1, 1]);
      assert.equal(scrollOffsetUp(layout, 3, 2, { unit: "visual" }), 2);
      // 5 rows, viewport 2 → max offset 3
      assert.equal(scrollOffsetDown(layout, 2, 2, { unit: "visual" }), 3);
    });

    it("clamps at boundaries", () => {
      const layout = makeScrollLayout([1, 1, 1]);
      assert.equal(scrollOffsetUp(layout, 0, 2, { unit: "visual", step: 5 }), 0);
      assert.equal(scrollOffsetDown(layout, 10, 2, { unit: "visual" }), 1);
    });

    it("returns clamped offset for non-positive step", () => {
      const layout = makeScrollLayout([1, 1, 1]);
      // step 0 returns clamped current offset (3 rows, viewport 2 → max offset 1)
      assert.equal(scrollOffsetUp(layout, 2, 2, { step: 0 }), 1);
    });
  });

  describe("scrollOffsetUp / scrollOffsetDown — logical unit", () => {
    it("jumps to previous/next logical line top", () => {
      const layout = makeScrollLayout([2, 3, 1]);
      // at offset 4 (line 2 row 1), startLine=2
      const up = scrollOffsetUp(layout, 4, 2, { unit: "logical" });
      assert.equal(up, 0); // line 1 startRow

      const down = scrollOffsetDown(layout, 0, 2, { unit: "logical" });
      assert.equal(down, 2); // line 2 startRow
    });

    it("supports multi logical step", () => {
      const layout = makeScrollLayout([1, 1, 1, 1, 1]);
      const offset = scrollOffsetDown(layout, 0, 2, { unit: "logical", step: 3 });
      assert.equal(offset, 3); // line 4 startRow
    });

    it("clamps when no previous line exists", () => {
      const layout = makeScrollLayout([2, 2, 2]);
      assert.equal(scrollOffsetUp(layout, 0, 2, { unit: "logical" }), 0);
    });

    it("clamps when no next line exists", () => {
      const layout = makeScrollLayout([2, 2, 2]);
      const max = clampScrollOffset(999, layout.totalRows, 2);
      assert.equal(scrollOffsetDown(layout, max, 2, { unit: "logical" }), max);
    });
  });

  describe("sliceVisibleRows", () => {
    it("returns empty string for empty layout", () => {
      assert.equal(sliceVisibleRows(EMPTY_SCROLL_LAYOUT, 0, 5), "");
    });

    it("slices exact row window", () => {
      const layout = makeScrollLayout([1, 1, 1]);
      assert.equal(sliceVisibleRows(layout, 1, 2), "L2R0\nL3R0");
    });

    it("clamps offset before slicing", () => {
      const layout = makeScrollLayout([1, 1, 1]);
      assert.equal(sliceVisibleRows(layout, 99, 2), "L2R0\nL3R0");
    });
  });
});
