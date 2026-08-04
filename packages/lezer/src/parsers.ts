import { parser as cppParser } from "@lezer/cpp";
import { parser as cssParser } from "@lezer/css";
import { parser as goParser } from "@lezer/go";
import { parser as htmlParser } from "@lezer/html";
import { parser as javaParser } from "@lezer/java";
import { parser as javascriptParser } from "@lezer/javascript";
import { parser as jsonParser } from "@lezer/json";
import { parser as markdownParser } from "@lezer/markdown";
import { parser as phpParser } from "@lezer/php";
import { parser as pythonParser } from "@lezer/python";
import { parser as rustParser } from "@lezer/rust";
import { parser as sassParser } from "@lezer/sass";
import { parser as xmlParser } from "@lezer/xml";
import { parser as yamlParser } from "@lezer/yaml";

import type { Tree } from "@lezer/common";

export type LezerParse = (input: string) => Tree;

export type LezerLanguage = {
  name: string;
  aliases?: string[];
  parse: LezerParse;
};

/**
 * Wrap parser `.parse` so mixed `@lezer/common` majors (e.g. markdown vs others)
 * do not fail structural assignability during the package build.
 */
const asParse =
  (parse: (input: string) => unknown): LezerParse =>
  (input) =>
    parse(input) as Tree;

const javascript: LezerLanguage = {
  name: "javascript",
  aliases: ["js", "mjs", "cjs"],
  parse: asParse((input) => javascriptParser.parse(input)),
};

const jsx: LezerLanguage = {
  name: "jsx",
  parse: asParse((input) => javascriptParser.configure({ dialect: "jsx" }).parse(input)),
};

const typescript: LezerLanguage = {
  name: "typescript",
  aliases: ["ts", "mts", "cts"],
  parse: asParse((input) => javascriptParser.configure({ dialect: "ts" }).parse(input)),
};

const tsx: LezerLanguage = {
  name: "tsx",
  parse: asParse((input) => javascriptParser.configure({ dialect: "jsx ts" }).parse(input)),
};

const json: LezerLanguage = {
  name: "json",
  parse: asParse((input) => jsonParser.parse(input)),
};

const python: LezerLanguage = {
  name: "python",
  aliases: ["py"],
  parse: asParse((input) => pythonParser.parse(input)),
};

const java: LezerLanguage = {
  name: "java",
  parse: asParse((input) => javaParser.parse(input)),
};

const cpp: LezerLanguage = {
  name: "cpp",
  aliases: ["c", "c++", "h", "hpp"],
  parse: asParse((input) => cppParser.parse(input)),
};

const css: LezerLanguage = {
  name: "css",
  parse: asParse((input) => cssParser.parse(input)),
};

const html: LezerLanguage = {
  name: "html",
  aliases: ["htm"],
  parse: asParse((input) => htmlParser.parse(input)),
};

const xml: LezerLanguage = {
  name: "xml",
  parse: asParse((input) => xmlParser.parse(input)),
};

const rust: LezerLanguage = {
  name: "rust",
  aliases: ["rs"],
  parse: asParse((input) => rustParser.parse(input)),
};

const go: LezerLanguage = {
  name: "go",
  aliases: ["golang"],
  parse: asParse((input) => goParser.parse(input)),
};

const php: LezerLanguage = {
  name: "php",
  parse: asParse((input) => phpParser.parse(input)),
};

const yaml: LezerLanguage = {
  name: "yaml",
  aliases: ["yml"],
  parse: asParse((input) => yamlParser.parse(input)),
};

const markdown: LezerLanguage = {
  name: "markdown",
  aliases: ["md"],
  parse: asParse((input) => markdownParser.parse(input)),
};

const sass: LezerLanguage = {
  name: "sass",
  aliases: ["scss"],
  parse: asParse((input) => sassParser.parse(input)),
};

export const defaultLanguages: LezerLanguage[] = [
  javascript,
  jsx,
  typescript,
  tsx,
  json,
  python,
  java,
  cpp,
  css,
  html,
  xml,
  rust,
  go,
  php,
  yaml,
  markdown,
  sass,
];

export type LezerLanguageName = (typeof defaultLanguages)[number]["name"];

const normalize = (lang: string) => lang.trim().toLowerCase();

export const createLanguageRegistry = (languages: LezerLanguage[] = defaultLanguages) => {
  const byName = new Map<string, LezerLanguage>();

  const register = (language: LezerLanguage) => {
    byName.set(normalize(language.name), language);
    for (const alias of language.aliases || []) {
      byName.set(normalize(alias), language);
    }
  };

  for (const language of languages) {
    register(language);
  }

  return {
    register,
    has: (lang: string) => byName.has(normalize(lang)),
    get: (lang: string) => byName.get(normalize(lang)),
    list: () => Array.from(new Set(byName.values())),
  };
};
