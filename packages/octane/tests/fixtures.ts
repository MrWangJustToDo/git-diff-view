export const representativeDiff = {
  oldFile: {
    fileName: "src/example.ts",
    fileLang: "typescript",
    content: "export const value = 1;\nexport const stable = true;\n",
  },
  newFile: {
    fileName: "src/example.ts",
    fileLang: "typescript",
    content: "export const value = 2;\nexport const stable = true;\n",
  },
  hunks: [
    [
      "--- a/src/example.ts",
      "+++ b/src/example.ts",
      "@@ -1,2 +1,2 @@",
      "-export const value = 1;",
      "+export const value = 2;",
      " export const stable = true;",
    ].join("\n"),
  ],
};
