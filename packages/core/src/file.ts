import { highlighter } from "@git-diff-view/lowlight";

import { Cache } from "./cache";

import type { DiffAST, DiffHighlighter, SyntaxLine } from "@git-diff-view/lowlight";

const map = new Cache<string, File>();

const devKey = "@git-diff-cache";

map.setMaxLength(50);

map.name = "@git-diff-view/core";

if (__DEV__ && typeof globalThis !== "undefined") {
  if (Array.isArray(globalThis[devKey])) {
    globalThis[devKey] = globalThis[devKey].filter((i) => i !== map);

    if (globalThis[devKey].length > 0) {
      console.warn("there are multiple instance of @git-diff-view/core in current environment!");
    }

    globalThis[devKey].push(map);
  } else {
    globalThis[devKey] = [map];
  }
}

export class File {
  ast?: DiffAST;

  rawFile: Record<number, string> = {};

  hasDoRaw: boolean = false;

  rawLength?: number;

  syntaxFile: Record<number, SyntaxLine> = {};

  hasDoSyntax: boolean = false;

  syntaxLength?: number;

  highlighterName?: string;

  maxLineNumber: number = 0;

  static createInstance(data: File) {
    const file = new File(data?.raw, data?.lang, data?.fileName);

    file.ast = data?.ast;

    file.rawFile = data?.rawFile;

    file.hasDoRaw = data?.hasDoRaw;

    file.rawLength = data?.rawLength;

    file.syntaxFile = data?.syntaxFile;

    file.hasDoSyntax = data?.hasDoSyntax;

    file.syntaxLength = data?.syntaxLength;

    file.highlighterName = data?.highlighterName;

    file.maxLineNumber = data?.maxLineNumber;

    return file;
  }

  constructor(
    readonly raw: string,
    readonly lang: string,
    readonly fileName?: string
  ) {
    Object.defineProperty(this, "__v_skip", { value: true });
  }

  doSyntax({
    registerHighlighter,
    theme,
  }: {
    registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
    theme?: "light" | "dark";
  }) {
    if (!this.raw || this.hasDoSyntax) return;

    const finalHighlighter = registerHighlighter || highlighter;

    if (this.syntaxLength) {
      __DEV__ && console.error("current file already doSyntax before!");
      return;
    }

    if (this.rawLength > finalHighlighter.maxLineToIgnoreSyntax) {
      __DEV__ && console.warn(`ignore syntax for current file, because the rawLength is too long: ${this.rawLength}`);
      return;
    }

    this.ast = finalHighlighter.getAST(this.raw, this.fileName, this.lang, theme);

    if (!this.ast) return;

    const { syntaxFileObject, syntaxFileLineNumber } = finalHighlighter.processAST(this.ast);

    this.syntaxFile = syntaxFileObject;

    this.syntaxLength = syntaxFileLineNumber;

    this.highlighterName = finalHighlighter.name;

    if (__DEV__) {
      this.#doCheck();
    }

    this.hasDoSyntax = true;
  }

  doRaw() {
    if (!this.raw || this.hasDoRaw) return;

    const rawString = this.raw;

    const rawArray = rawString.split("\n");

    this.rawLength = rawArray.length;

    this.maxLineNumber = rawArray.length;

    this.rawFile = {};

    for (let i = 0; i < rawArray.length; i++) {
      this.rawFile[i + 1] = i < rawArray.length - 1 ? rawArray[i] + "\n" : rawArray[i];
    }

    // reduce 对于大数组性能很差
    // this.rawFile = rawArray.reduce(
    //   (p, item, index) => ({
    //     ...p,
    //     [index + 1]: index < rawArray.length - 1 ? item + "\n" : item,
    //   }),
    //   {}
    // );

    this.hasDoRaw = true;
  }

  #doCheck() {
    if (this.rawLength && this.syntaxLength) {
      if (this.rawLength !== this.syntaxLength) {
        console.warn("the rawLength not match for the syntaxLength");
      }
      Object.values(this.syntaxFile).forEach(({ value, lineNumber }) => {
        if (value !== this.rawFile[lineNumber]) {
          console.log(
            "some line not match:" + value + " __ " + this.rawFile[lineNumber] + " __ at: " + lineNumber + " lineNumber"
          );
        }
      });
    }
  }
}

// TODO add highlight engine key to cache key
export const getFile = (raw: string, lang: string, theme: "light" | "dark", fileName?: string, uuid?: string) => {
  let key = raw + "--" + __VERSION__ + "--" + theme + "--" + lang;

  if (uuid) {
    key = uuid + "--" + __VERSION__ + "--" + theme + "--" + lang;
  }

  let otherThemeKey = raw + "--" + __VERSION__ + "--" + (theme === "light" ? "dark" : "light") + "--" + lang;

  if (uuid) {
    otherThemeKey = uuid + "--" + __VERSION__ + "--" + (theme === "light" ? "dark" : "light") + "--" + lang;
  }

  if (map.has(key)) return map.get(key);

  if (map.has(otherThemeKey)) {
    const cacheFile = map.get(otherThemeKey);
    // 基于css的语法数不需要重新生成
    if (cacheFile.highlighterName === highlighter.name) {
      return cacheFile;
    }
  }

  const file = new File(raw, lang, fileName);

  map.set(key, file);

  return file;
};

export const _cacheMap = map;
