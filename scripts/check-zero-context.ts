/**
 * Regression checks for zero-context diffs (`git diff -U0` / `--unified=0`), issue #77.
 *
 *   npx ts-node --transpile-only -O '{"module":"commonjs","target":"es2022"}' scripts/check-zero-context.ts
 *
 * With `-U0` a hunk is followed directly by an added/deleted line — there is no context line after
 * the `@@` header. Two things used to go wrong:
 *
 *   1. `prevHunkLine` was dropped as soon as the next line was not a context line, so the hunk never
 *      received its `splitInfo` / `unifiedInfo` and the rows above it stayed hidden for ever
 *      (`onAllExpand` could not reveal them).
 *   2. The two-pointer walk in `buildSplitDiffLines` / `buildUnifiedDiffLines` advanced the opposite
 *      side's line counter without consuming it, shifting every row after the hunk and leaving blank
 *      values behind.
 */

// injected by the bundler in real builds; must be set before core is loaded, hence require()
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
(globalThis as unknown as { __VERSION__: string }).__VERSION__ = "0.0.0-check";

/* eslint-disable @typescript-eslint/no-var-requires, import/order */
const { DiffFile } = require("../packages/core/src") as typeof import("../packages/core/src");
/* eslint-enable @typescript-eslint/no-var-requires, import/order */

const failures: string[] = [];

const assertRow = (label: string, actual: string[], expected: string[]) => {
  const ok = actual.length === expected.length && actual.every((row, i) => row === expected[i]);

  if (ok) {
    console.log(`  ok   ${label}`);
    return;
  }

  console.log(`  FAIL ${label}`);
  console.log(`         expected: ${expected.join(", ")}`);
  console.log(`         actual:   ${actual.join(", ")}`);
  failures.push(label);
};

/** Build a unified diff view and read every row back as `old:new "value"`. */
const readUnified = (oldContent: string, newContent: string, diff: string) => {
  const file = new DiffFile("a.txt", oldContent, "b.txt", newContent, [diff], "txt", "txt");

  file.initTheme("light");
  file.init();
  file.buildUnifiedDiffLines();
  file.onAllExpand("unified");

  const rows: string[] = [];

  for (let i = 0; i < file.unifiedLineLength; i++) {
    const line = file.getUnifiedLine(i)!;
    rows.push(
      `${line.oldLineNumber ?? "-"}:${line.newLineNumber ?? "-"} ${JSON.stringify(line.value)}${
        line.isHidden ? " (hidden)" : ""
      }`
    );
  }

  return rows;
};

/** Build a split view and read the left / right column back as `old "value"` / `new "value"`. */
const readSplit = (oldContent: string, newContent: string, diff: string) => {
  const file = new DiffFile("a.txt", oldContent, "b.txt", newContent, [diff], "txt", "txt");

  file.initTheme("light");
  file.init();
  file.buildSplitDiffLines();
  file.onAllExpand("split");

  const left: string[] = [];
  const right: string[] = [];

  for (let i = 0; i < file.splitLineLength; i++) {
    const l = file.getSplitLeftLine(i);
    const r = file.getSplitRightLine(i);

    left.push(`${l.lineNumber ?? "-"} ${JSON.stringify(l.value ?? null)}${l.isHidden ? " (hidden)" : ""}`);
    right.push(`${r.lineNumber ?? "-"} ${JSON.stringify(r.value ?? null)}${r.isHidden ? " (hidden)" : ""}`);
  }

  return { left, right };
};

/**
 * Generic invariant: after `onAllExpand` nothing may stay hidden, and every row must carry the real
 * content of the line number it claims — that is what catches a shifted or blank row anywhere in the
 * file, without having to spell out every expected row by hand.
 */
const assertInvariants = (
  label: string,
  oldContent: string,
  newContent: string,
  diff: string,
  mode: "split" | "unified"
) => {
  const oldLines = oldContent ? oldContent.split("\n").slice(0, -1) : [];
  const newLines = newContent ? newContent.split("\n").slice(0, -1) : [];
  const problems: string[] = [];

  const check = (side: "old" | "new", rowIndex: number, lineNumber: number | null, value?: string) => {
    const expected = lineNumber ? (side === "old" ? oldLines : newLines)[lineNumber - 1] : undefined;

    if (!lineNumber) return;

    if (expected === undefined) {
      problems.push(`${side} row ${rowIndex} claims line ${lineNumber}, which does not exist`);
    } else if (value !== `${expected}\n`) {
      problems.push(
        `${side} row ${rowIndex} line ${lineNumber}: ${JSON.stringify(value)} !== ${JSON.stringify(`${expected}\n`)}`
      );
    }
  };

  const file = new DiffFile("a.txt", oldContent, "b.txt", newContent, [diff], "txt", "txt");

  file.initTheme("light");
  file.init();

  if (mode === "split") {
    file.buildSplitDiffLines();
    file.onAllExpand("split");

    for (let i = 0; i < file.splitLineLength; i++) {
      const l = file.getSplitLeftLine(i);
      const r = file.getSplitRightLine(i);

      if (l.isHidden || r.isHidden) problems.push(`row ${i} is still hidden after onAllExpand`);

      check("old", i, l.lineNumber, l.value);
      check("new", i, r.lineNumber, r.value);
    }
  } else {
    file.buildUnifiedDiffLines();
    file.onAllExpand("unified");

    for (let i = 0; i < file.unifiedLineLength; i++) {
      const line = file.getUnifiedLine(i)!;

      if (line.isHidden) problems.push(`row ${i} is still hidden after onAllExpand`);

      check("old", i, line.oldLineNumber, line.value);
      check("new", i, line.newLineNumber, line.value);
    }
  }

  assertRow(`${label} (${mode}) invariant`, problems.slice(0, 3), []);
};

const REPLACE_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -2 +2 @@\n-b\n+B\n";
const DELETE_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -2 +1,0 @@\n-b\n";
const INSERT_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -2,0 +3 @@\n+X\n";

console.log("zero-context hunks — unified");
assertRow("replace keeps the trailing line number", readUnified("a\nb\nc\n", "a\nB\nc\n", REPLACE_DIFF), [
  '1:1 "a\\n"',
  '2:- "b\\n"',
  '-:2 "B\\n"',
  '3:3 "c\\n"',
]);
assertRow("delete keeps the trailing line number and content", readUnified("a\nb\nc\n", "a\nc\n", DELETE_DIFF), [
  '1:1 "a\\n"',
  '2:- "b\\n"',
  '3:2 "c\\n"',
]);
assertRow("insert keeps the trailing line number", readUnified("a\nb\nc\n", "a\nb\nX\nc\n", INSERT_DIFF), [
  '1:1 "a\\n"',
  '2:2 "b\\n"',
  '-:3 "X\\n"',
  '3:4 "c\\n"',
]);

console.log("\nzero-context hunks — split");
const deleteSplit = readSplit("a\nb\nc\n", "a\nc\n", DELETE_DIFF);
assertRow("delete: left column", deleteSplit.left, ['1 "a\\n"', '2 "b\\n"', '3 "c\\n"']);
assertRow("delete: right column after the hunk", deleteSplit.right, ['1 "a\\n"', "- null", '2 "c\\n"']);

const insertSplit = readSplit("a\nb\nc\n", "a\nb\nX\nc\n", INSERT_DIFF);
assertRow("insert: left column after the hunk", insertSplit.left, ['1 "a\\n"', '2 "b\\n"', "- null", '3 "c\\n"']);
assertRow("insert: right column", insertSplit.right, ['1 "a\\n"', '2 "b\\n"', '3 "X\\n"', '4 "c\\n"']);

console.log("\nleading lines stay expandable (root cause 1)");
const leading = new DiffFile("a.txt", "a\nb\nc\n", "b.txt", "a\nB\nc\n", [REPLACE_DIFF], "txt", "txt");
leading.initTheme("light");
leading.init();
leading.buildUnifiedDiffLines();
leading.onAllExpand("unified");

const firstHunk = leading.getUnifiedHunkLine(1);
assertRow(
  "first hunk receives its unifiedInfo so onAllExpand can reveal the rows above it",
  [firstHunk?.unifiedInfo ? "has info" : "no info", leading.getUnifiedLine(0)?.isHidden ? "hidden" : "visible"],
  ["has info", "visible"]
);

const leadingSplit = new DiffFile("a.txt", "a\nb\nc\n", "b.txt", "a\nB\nc\n", [REPLACE_DIFF], "txt", "txt");
leadingSplit.initTheme("light");
leadingSplit.init();
leadingSplit.buildSplitDiffLines();
leadingSplit.onAllExpand("split");

assertRow(
  "first hunk receives its splitInfo",
  [
    leadingSplit.getSplitHunkLine(1)?.splitInfo ? "has info" : "no info",
    leadingSplit.getSplitLeftLine(0)?.isHidden ? "hidden" : "visible",
  ],
  ["has info", "visible"]
);

console.log("\nmultiple zero-context hunks");
const MULTI_OLD = "a\nb\nc\nd\ne\nf\ng\nh\n";
const MULTI_NEW = "a\nB\nc\nd\nf\ng\nX\nh\n";
// produced by `git diff --no-index -U0`; note git appends the trailing source line to the header
const MULTI_DIFF = [
  "diff --git a/a.txt b/b.txt",
  "--- a/a.txt",
  "+++ b/b.txt",
  "@@ -2 +2 @@ a",
  "-b",
  "+B",
  "@@ -5 +4,0 @@ d",
  "-e",
  "@@ -7,0 +7 @@ g",
  "+X",
  "",
].join("\n");

assertRow("unified rows across three hunks", readUnified(MULTI_OLD, MULTI_NEW, MULTI_DIFF), [
  '1:1 "a\\n"',
  '2:- "b\\n"',
  '-:2 "B\\n"',
  '3:3 "c\\n"',
  '4:4 "d\\n"',
  '5:- "e\\n"',
  '6:5 "f\\n"',
  '7:6 "g\\n"',
  '-:7 "X\\n"',
  '8:8 "h\\n"',
]);
assertInvariants("three hunks", MULTI_OLD, MULTI_NEW, MULTI_DIFF, "unified");
assertInvariants("three hunks", MULTI_OLD, MULTI_NEW, MULTI_DIFF, "split");

console.log("\nfile edges");
const EOF_DELETE_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -3 +2,0 @@ b\n-c\n";
assertRow("deletion at end of file", readUnified("a\nb\nc\n", "a\nb\n", EOF_DELETE_DIFF), [
  '1:1 "a\\n"',
  '2:2 "b\\n"',
  '3:- "c\\n"',
]);

const BOF_INSERT_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -0,0 +1 @@\n+X\n";
assertRow("insertion at start of file", readUnified("a\nb\n", "X\na\nb\n", BOF_INSERT_DIFF), [
  '-:1 "X\\n"',
  '1:2 "a\\n"',
  '2:3 "b\\n"',
]);

const WHOLE_DELETE_DIFF = "diff --git a/a.txt b/b.txt\n--- a/a.txt\n+++ b/b.txt\n@@ -1,3 +0,0 @@\n-a\n-b\n-c\n";
assertRow("deletion of the whole file", readUnified("a\nb\nc\n", "", WHOLE_DELETE_DIFF), [
  '1:- "a\\n"',
  '2:- "b\\n"',
  '3:- "c\\n"',
]);

// the last line of the new file has no trailing newline, so its value must not gain one
const NO_EOL_DIFF = [
  "diff --git a/a.txt b/b.txt",
  "--- a/a.txt",
  "+++ b/b.txt",
  "@@ -2,2 +2,2 @@ a",
  "-b",
  "-c",
  "+B",
  "+c",
  "\\ No newline at end of file",
  "",
].join("\n");
assertRow("replacement ending without a newline", readUnified("a\nb\nc\n", "a\nB\nc", NO_EOL_DIFF), [
  '1:1 "a\\n"',
  '2:- "b\\n"',
  '3:- "c\\n"',
  '-:2 "B\\n"',
  '-:3 "c"',
]);

// the old file lacks the trailing newline and the new one appends after it
const ADD_AFTER_NO_EOL_DIFF = [
  "diff --git a/a.txt b/b.txt",
  "--- a/a.txt",
  "+++ b/b.txt",
  "@@ -3 +3,2 @@ b",
  "-c",
  "\\ No newline at end of file",
  "+c",
  "+X",
  "",
].join("\n");
assertRow("append after a line without a newline", readUnified("a\nb\nc", "a\nb\nc\nX\n", ADD_AFTER_NO_EOL_DIFF), [
  '1:1 "a\\n"',
  '2:2 "b\\n"',
  '3:- "c"',
  '-:3 "c\\n"',
  '-:4 "X\\n"',
]);

assertInvariants("replace", "a\nb\nc\n", "a\nB\nc\n", REPLACE_DIFF, "unified");
assertInvariants("replace", "a\nb\nc\n", "a\nB\nc\n", REPLACE_DIFF, "split");
assertInvariants("delete", "a\nb\nc\n", "a\nc\n", DELETE_DIFF, "unified");
assertInvariants("delete", "a\nb\nc\n", "a\nc\n", DELETE_DIFF, "split");
assertInvariants("insert", "a\nb\nc\n", "a\nb\nX\nc\n", INSERT_DIFF, "unified");
assertInvariants("insert", "a\nb\nc\n", "a\nb\nX\nc\n", INSERT_DIFF, "split");
assertInvariants("end of file delete", "a\nb\nc\n", "a\nb\n", EOF_DELETE_DIFF, "split");
assertInvariants("start of file insert", "a\nb\n", "X\na\nb\n", BOF_INSERT_DIFF, "split");

console.log("\n-u3 regression (default git context)");
const U3_DIFF = [
  "diff --git a/a.txt b/b.txt",
  "--- a/a.txt",
  "+++ b/b.txt",
  "@@ -1,3 +1,3 @@",
  " a",
  "-b",
  "+B",
  " c",
  "",
].join("\n");

assertRow("three context lines still round-trip", readUnified("a\nb\nc\n", "a\nB\nc\n", U3_DIFF), [
  '1:1 "a\\n"',
  '2:- "b\\n"',
  '-:2 "B\\n"',
  '3:3 "c\\n"',
]);

const U3_MULTI_OLD = "a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\n";
const U3_MULTI_NEW = "a\nB\nc\nd\ne\nf\ng\nh\ni\nj\nK\nl\nm\nn\no\n";
const U3_MULTI_DIFF = [
  "diff --git a/a.txt b/b.txt",
  "--- a/a.txt",
  "+++ b/b.txt",
  "@@ -1,5 +1,5 @@",
  " a",
  "-b",
  "+B",
  " c",
  " d",
  " e",
  "@@ -8,7 +8,7 @@ g",
  " h",
  " i",
  " j",
  "-k",
  "+K",
  " l",
  " m",
  " n",
  "",
].join("\n");

// the second hunk's bar guards the two rows between the hunks (f, g) and sits in front of row 8 (h)
const u3Multi = new DiffFile("a.txt", U3_MULTI_OLD, "b.txt", U3_MULTI_NEW, [U3_MULTI_DIFF], "txt", "txt");
u3Multi.initTheme("light");
u3Multi.init();
u3Multi.buildUnifiedDiffLines();

const secondHunk = u3Multi.getUnifiedHunkLine(8)?.unifiedInfo;
assertRow(
  "second hunk still guards only the gap above it",
  [`${secondHunk?.startHiddenIndex}-${secondHunk?.endHiddenIndex}`],
  ["6-8"]
);

assertInvariants("three context lines, multiple hunks", U3_MULTI_OLD, U3_MULTI_NEW, U3_MULTI_DIFF, "unified");
assertInvariants("three context lines, multiple hunks", U3_MULTI_OLD, U3_MULTI_NEW, U3_MULTI_DIFF, "split");

if (failures.length) {
  console.log(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log("\nall checks passed");
