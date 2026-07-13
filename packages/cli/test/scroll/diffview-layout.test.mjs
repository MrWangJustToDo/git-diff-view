import {
  DiffFile,
  DiffModeEnum,
  buildDiffViewScrollLayout,
  getVisibleDiffScrollLines,
  computeScrollState,
  iterateDiffDisplayEntries,
} from "@git-diff-view/cli";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const SAMPLE_HUNKS = [
  `diff --git a/demo.ts b/demo.ts
index 1111111..2222222 100644
--- a/demo.ts
+++ b/demo.ts
@@ -1,5 +1,6 @@
 line1
-line2
+line2 changed with ${"x".repeat(80)}
 line3
+line4 added
 line5
`,
];

function createSampleDiffFile() {
  const diffFile = new DiffFile(
    "demo.ts",
    "line1\nline2\nline3\nline5\n",
    "demo.ts",
    "line1\nline2 changed\nline3\nline4 added\nline5\n",
    SAMPLE_HUNKS,
    "typescript",
    "typescript"
  );
  diffFile.initTheme("dark");
  diffFile.initRaw();
  diffFile.buildSplitDiffLines();
  diffFile.buildUnifiedDiffLines();
  return diffFile;
}

describe("buildDiffViewScrollLayout", () => {
  it("builds unified scroll sequence with hunk/content entries", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 80,
      mode: DiffModeEnum.Unified,
    });

    assert.ok(layout.totalLines > 0);
    assert.ok(layout.totalRows >= layout.totalLines);
    assert.ok(layout.lines.some((line) => line.kind === "content"));
  });

  it("builds split scroll sequence", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 100,
      mode: DiffModeEnum.Split,
    });

    assert.ok(layout.totalLines > 0);
    assert.ok(layout.lines.some((line) => line.kind === "content"));
  });

  it("includes extend lines when extend data is present", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 80,
      mode: DiffModeEnum.Unified,
      extendData: { newFile: { 2: { data: { note: "review" } } } },
      extendLineHeight: 2,
      hasRenderExtendLine: true,
    });

    assert.ok(layout.lines.some((line) => line.kind === "extend"));
  });

  it("returns empty layout for invalid columns", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 0,
      mode: DiffModeEnum.Unified,
    });

    assert.equal(layout.totalLines, 0);
    assert.equal(layout.totalRows, 0);
  });

  it("skips the first hunk line to match DiffView rendering", () => {
    const diffFile = createSampleDiffFile();

    for (const mode of [DiffModeEnum.Unified, DiffModeEnum.Split]) {
      const layout = buildDiffViewScrollLayout({
        diffFile,
        columns: 80,
        mode,
      });

      assert.equal(layout.lines[0]?.kind, "content", `${mode}: first scroll line is content`);
      assert.ok(
        !layout.lines.slice(0, 2).some((line) => line.kind === "hunk"),
        `${mode}: no hunk in the first content block`
      );

      const firstContentDiffIndex = layout.lines[0]?.diffIndex;
      const hunkBeforeFirstContent = layout.lines.find(
        (line) => line.kind === "hunk" && line.diffIndex === firstContentDiffIndex
      );
      assert.equal(hunkBeforeFirstContent, undefined, `${mode}: no hunk tied to first content index`);
    }
  });

  it("iterateDiffDisplayEntries matches scroll layout entry sequence", () => {
    const diffFile = createSampleDiffFile();

    for (const mode of [DiffModeEnum.Unified, DiffModeEnum.Split]) {
      const iterateOptions = { diffFile, mode };
      const entries = iterateDiffDisplayEntries(iterateOptions);
      const layout = buildDiffViewScrollLayout({ ...iterateOptions, columns: 80 });

      assert.equal(entries.length, layout.totalLines, `${mode}: entry count matches layout lines`);

      entries.forEach((entry, index) => {
        const line = layout.lines[index];
        assert.equal(line?.kind, entry.kind, `${mode}: kind at index ${index}`);
        assert.equal(line?.diffIndex, entry.diffIndex, `${mode}: diffIndex at index ${index}`);
      });
    }
  });
});

describe("getVisibleDiffScrollLines", () => {
  it("returns visible entries within viewport", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 40,
      mode: DiffModeEnum.Unified,
    });

    assert.ok(layout.totalRows > 3);

    const visible = getVisibleDiffScrollLines(layout, 1, 3);
    assert.ok(visible.length > 0);

    const totalVisibleRows = visible.reduce(
      (sum, entry) => sum + (entry.clip?.rowCount ?? entry.endRow - entry.startRow),
      0
    );
    assert.ok(totalVisibleRows <= 3);
  });

  it("integrates with computeScrollState startLine semantics", () => {
    const diffFile = createSampleDiffFile();
    const layout = buildDiffViewScrollLayout({
      diffFile,
      columns: 30,
      mode: DiffModeEnum.Unified,
    });

    const state = computeScrollState(layout, 2, 3);
    assert.ok(state.startLine >= 1);
    assert.ok(state.endLine >= state.startLine);
  });
});
