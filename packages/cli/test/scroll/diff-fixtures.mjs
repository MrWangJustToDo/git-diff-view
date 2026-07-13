/** Old side content for DiffView interactive scroll test */
export const DIFF_OLD_CONTENT = [
  "// DiffView scroll interactive test — old file",
  "",
  "function fibonacci(n: number): number {",
  "  if (n <= 1) return n;",
  "  return fibonacci(n - 1) + fibonacci(n - 2);",
  "}",
  "",
  "const LEGACY = '" + "o".repeat(120) + "';",
  "",
  ...Array.from({ length: 50 }, (_, i) => `const old_item_${i + 1} = ${i + 1}; // scroll target ${i + 10}`),
  "",
  "export { fibonacci };",
].join("\n");

/** New side content — multiple hunks, long wrap line, extra export */
export const DIFF_NEW_CONTENT = [
  "// DiffView scroll interactive test — new file",
  "",
  "function fibonacci(n: number): number {",
  "  if (n <= 1) return n;",
  "  return fibonacci(n - 1) + fibonacci(n - 2);",
  "}",
  "",
  "const LEGACY = '" + "n".repeat(120) + "'; // changed padding",
  "",
  ...Array.from({ length: 50 }, (_, i) => {
    if (i === 12) {
      return `const new_item_${i + 1} = '${"W".repeat(100)}'; // long wrapped line ${i + 10}`;
    }
    if (i === 25) {
      return `const new_item_${i + 1} = ${i + 1}; // extend line target ${i + 10}`;
    }
    return `const old_item_${i + 1} = ${i + 1}; // scroll target ${i + 10}`;
  }),
  "",
  "export { fibonacci, LEGACY };",
].join("\n");

/** Marker comment in DIFF_NEW_CONTENT for extend line lookup */
export const DIFF_EXTEND_MARKER = "extend line target";
