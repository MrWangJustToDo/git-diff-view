/**
 * Minimal check for the hunk expand clamping added in #76.
 *
 * The repo has no test runner, so this is a plain ts-node script:
 *
 *   npx ts-node --transpile-only -O '{"module":"commonjs","target":"es2022"}' scripts/check-expand-clamp.ts
 *
 * A large file with a single changed line produces one hunk bar whose hidden range covers every
 * line above it. Expanding that bar repeatedly used to walk past its own range and reveal rows
 * belonging to the next bar, so the assertions below check the range never crosses its own bounds.
 */

// injected by the bundler in real builds; must be set before core is loaded, hence require()
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
(globalThis as unknown as { __VERSION__: string }).__VERSION__ = "0.0.0-check";

/* eslint-disable @typescript-eslint/no-var-requires, import/order */
const { createTwoFilesPatch } = require("diff") as typeof import("diff");
const { DiffFile } = require("../packages/core/src") as typeof import("../packages/core/src");
/* eslint-enable @typescript-eslint/no-var-requires, import/order */

const TOTAL_LINES = 200;
const CHANGED_INDEX = 100;

const buildFile = () => {
  const lines = Array.from({ length: TOTAL_LINES }, (_, i) => `line ${i + 1}`);
  const oldFile = lines.join("\n") + "\n";

  const newLines = [...lines];
  newLines[CHANGED_INDEX] = "line 101 changed";
  const newFile = newLines.join("\n") + "\n";

  const patch = createTwoFilesPatch("a.ts", "a.ts", oldFile, newFile, "", "");

  const file = new DiffFile("a.ts", oldFile, "a.ts", newFile, [patch], "ts", "ts");

  file.initRaw();
  file.buildSplitDiffLines();
  file.buildUnifiedDiffLines();

  return file;
};

const failures: string[] = [];

const assert = (label: string, ok: boolean, detail = "") => {
  if (ok) {
    console.log(`  ok   ${label}`);
  } else {
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
};

const findHunkIndex = (file: ReturnType<typeof buildFile>, side: "split" | "unified") => {
  const length = side === "split" ? file.splitLineLength : file.diffLineLength;

  for (let i = 0; i < length; i++) {
    const hunk = side === "split" ? file.getSplitHunkLine(i) : file.getUnifiedHunkLine(i);
    if (hunk) return i;
  }

  return -1;
};

const checkSplit = () => {
  const file = buildFile();
  const index = findHunkIndex(file, "split");

  if (index < 0) return assert("split: hunk bar exists", false);

  const before = file.getSplitHunkLine(index)!.splitInfo!;
  const { startHiddenIndex, endHiddenIndex } = before;

  // deliberately overshoot: 3 expansions of composeLen in one direction
  // needTrigger=false keeps the hunk map stable so the same bar can be expanded repeatedly
  for (let i = 0; i < 5; i++) file.onSplitHunkExpand("down", index, false);

  const afterDown = file.getSplitHunkLine(index)!.splitInfo!;

  assert(
    "split: expandDown never crosses endHiddenIndex",
    afterDown.startHiddenIndex <= endHiddenIndex,
    `start=${afterDown.startHiddenIndex} bound=${endHiddenIndex}`
  );

  for (let i = 0; i < 10; i++) file.onSplitHunkExpand("up", index, false);

  const afterUp = file.getSplitHunkLine(index)!.splitInfo!;

  assert(
    "split: expandUp never crosses startHiddenIndex",
    afterUp.endHiddenIndex >= startHiddenIndex,
    `end=${afterUp.endHiddenIndex} bound=${startHiddenIndex}`
  );

  assert(
    "split: range stays ordered",
    afterUp.startHiddenIndex <= afterUp.endHiddenIndex,
    `start=${afterUp.startHiddenIndex} end=${afterUp.endHiddenIndex}`
  );
};

const checkUnified = () => {
  const file = buildFile();
  const index = findHunkIndex(file, "unified");

  if (index < 0) return assert("unified: hunk bar exists", false);

  const before = file.getUnifiedHunkLine(index)!.unifiedInfo!;
  const { startHiddenIndex, endHiddenIndex } = before;

  for (let i = 0; i < 5; i++) file.onUnifiedHunkExpand("down", index, false);

  const afterDown = file.getUnifiedHunkLine(index)!.unifiedInfo!;

  assert(
    "unified: expandDown never crosses endHiddenIndex",
    afterDown.startHiddenIndex <= endHiddenIndex,
    `start=${afterDown.startHiddenIndex} bound=${endHiddenIndex}`
  );

  for (let i = 0; i < 10; i++) file.onUnifiedHunkExpand("up", index, false);

  const afterUp = file.getUnifiedHunkLine(index)!.unifiedInfo!;

  assert(
    "unified: expandUp never crosses startHiddenIndex",
    afterUp.endHiddenIndex >= startHiddenIndex,
    `end=${afterUp.endHiddenIndex} bound=${startHiddenIndex}`
  );

  assert(
    "unified: range stays ordered",
    afterUp.startHiddenIndex <= afterUp.endHiddenIndex,
    `start=${afterUp.startHiddenIndex} end=${afterUp.endHiddenIndex}`
  );
};

console.log("hunk expand clamp");
checkSplit();
checkUnified();

if (failures.length) {
  console.log(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log("\nall checks passed");
