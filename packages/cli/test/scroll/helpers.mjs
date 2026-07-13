/**
 * Synthetic scroll layouts for unit tests.
 * Each entry is the visual row count for one logical line (1-based line numbers).
 */
export function makeScrollLayout(rowCounts) {
  const rows = [];
  const lines = [];

  rowCounts.forEach((rowCount, index) => {
    const lineNumber = index + 1;
    const startRow = rows.length;

    for (let row = 0; row < rowCount; row++) {
      rows.push(`L${lineNumber}R${row}`);
    }

    lines.push({
      lineNumber,
      startRow,
      endRow: rows.length,
    });
  });

  return {
    rows,
    lines,
    totalRows: rows.length,
    totalLines: lines.length,
  };
}

export function defaultCodeViewOptions() {
  return {
    enableHighlight: false,
    noBG: true,
    tabSpace: false,
    tabWidth: "medium",
    themeColors: {
      plainLineNumber: { light: "#f0f0f0", dark: "#1e1e1e" },
      plainLineNumberColor: { light: "#666", dark: "#888" },
      plainContent: { light: "#fff", dark: "#1e1e1e" },
    },
  };
}

export function createPlainFile(getFile, content, fileName = "sample.ts") {
  const file = getFile(content, "typescript", "light", fileName);
  file.doRaw();
  return file;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

export function assertDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}:\n  expected ${e}\n  got      ${a}`);
  }
}
