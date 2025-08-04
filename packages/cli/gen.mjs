import fs from "fs";
import path from "path";
import { parse } from "postcss";
import process from "process";

const readCssFile = async (filePath) => {
  const fullPath = path.resolve(process.cwd(), filePath);
  return await fs.promises.readFile(fullPath, { encoding: "utf-8" });
};

function cssToJson(cssString) {
  const root = parse(cssString);
  const result = {};

  root.walkRules((rule) => {
    const styles = {};

    rule.walkDecls((decl) => {
      styles[decl.prop] = decl.value;
    });

    rule.selectors.forEach((selector) => {
      if (selector.includes(" ")) return;
      result[selector.startsWith(".") ? selector.slice(1) : selector] = styles;
    });
  });

  return result;
}

const start = async () => {
  const cssFilePath = "node_modules/highlight.js/styles/github-dark.css";
  const cssContent = await readCssFile(cssFilePath);
  const re = cssToJson(cssContent);
  console.log("CSS to JSON conversion result:", re);
};

start();
