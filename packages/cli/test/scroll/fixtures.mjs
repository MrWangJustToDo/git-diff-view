/** Empty file */
export const EMPTY = "";

/** Single short line */
export const SINGLE_LINE = "console.log('hello');\n";

/** Multiple short lines */
export const SHORT_LINES = ["line 1", "line 2", "line 3", "line 4", "line 5"].join("\n") + "\n";

/** One very long ASCII line that will wrap at narrow width */
export const LONG_ASCII_LINE = "const value = '" + "x".repeat(200) + "'; // padding to force multiple visual rows\n";

/** Mix: short lines + one long line in the middle */
export const MIXED_LENGTH =
  [
    "import fs from 'fs';",
    LONG_ASCII_LINE.trimEnd(),
    "export default value;",
    "function main() {",
    "  return 42;",
    "}",
  ].join("\n") + "\n";

/** Empty lines between content */
export const WITH_EMPTY_LINES = ["first", "", "", "after blanks", "last"].join("\n") + "\n";

/** CJK characters (double-width) — wrap boundaries differ from ASCII */
export const CJK_CONTENT = "中文测试一行" + "汉字".repeat(40) + "\n下一行\n";

/** Tabs — relevant when codeViewTabSpace is enabled */
export const TAB_CONTENT = "\t\tfunction foo() {\n\t\t\treturn 1;\n\t\t}\n";

/** Emoji / wide chars */
export const EMOJI_CONTENT = "🚀 rocket " + "emoji ".repeat(30) + "\nplain line\n";

/** Many lines for scroll-through testing */
export const MANY_LINES = Array.from({ length: 120 }, (_, i) => `// line ${i + 1}`).join("\n") + "\n";

/** Long file with periodic long lines */
export const MANY_WITH_WRAPS =
  Array.from({ length: 80 }, (_, i) => {
    if (i % 10 === 5) {
      return `// block ${i + 1}: ` + "W".repeat(120);
    }
    return `// line ${i + 1}`;
  }).join("\n") + "\n";

/** Only whitespace lines */
export const WHITESPACE_ONLY = "   \n\t\n  \t  \n";

/** Single character lines */
export const TINY_LINES = "a\nb\nc\nd\ne\n";

/** Content for interactive demo (readable + scrollable) */
export const INTERACTIVE_CONTENT =
  [
    "// CodeView scroll interactive test",
    "// Use keyboard shortcuts shown in the footer",
    "",
    "function fibonacci(n: number): number {",
    "  if (n <= 1) return n;",
    "  return fibonacci(n - 1) + fibonacci(n - 2);",
    "}",
    "",
    LONG_ASCII_LINE.trimEnd(),
    "",
    ...Array.from({ length: 60 }, (_, i) => `const item_${i + 1} = ${i + 1}; // scroll target line ${i + 10}`),
  ].join("\n") + "\n";
