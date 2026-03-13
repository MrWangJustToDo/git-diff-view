import { Cache } from "./cache";
import { getPlainLineTemplate, getSyntaxLineTemplate, processTransformForFile } from "./parse";

import type { DiffAST, DiffHighlighter, DiffHighlighterLang, SyntaxLine } from "@git-diff-view/lowlight";

let _defaultHighlighter: Omit<DiffHighlighter, "getHighlighterEngine"> | null = null;

/**
 * Register a default highlighter to use when no `registerHighlighter` is
 * provided to `DiffView`. This is called automatically by
 * `@git-diff-view/lowlight` when it is imported, so most users don't need
 * to call this directly.
 */
export function setDefaultHighlighter(h: Omit<DiffHighlighter, "getHighlighterEngine">) {
  _defaultHighlighter = h;
}

const map = new Cache<string, File>();

const devKey = "@git-diff-cache";

map.setMaxLength(50);

map.name = "@git-diff-view/core";

if (__DEV__ && typeof globalThis !== "undefined") {
  if (Array.isArray(globalThis[devKey])) {
    globalThis[devKey] = globalThis[devKey].filter((i) => i !== map);

    if (globalThis[devKey].length > 0) {
      console.warn(
        "[@git-diff-view/core] Multiple instances of @git-diff-view/core detected in the current environment."
      );
    }

    globalThis[devKey].push(map);
  } else {
    globalThis[devKey] = [map];
  }
}

type SyntaxLineWithTemplate = SyntaxLine & {
  template?: string;
};

export class File {
  ast?: DiffAST;

  theme?: "light" | "dark";

  rawFile: Record<number, string> = {};

  hasDoRaw: boolean = false;

  rawLength?: number;

  syntaxFile: Record<number | string, SyntaxLineWithTemplate> = {};

  plainFile: Record<number | string, { value: string; template?: string }> = {};

  hasDoSyntax: boolean = false;

  syntaxLength?: number;

  highlighterName?: DiffHighlighter["name"];

  highlighterType?: DiffHighlighter["type"];

  maxLineNumber: number = 0;

  static createInstance(data: File) {
    const file = new File(data?.raw, data?.lang, data?.fileName);

    file.ast = data?.ast;

    file.theme = data?.theme;

    file.rawFile = data?.rawFile || {};

    file.plainFile = data?.plainFile || {};

    file.hasDoRaw = data?.hasDoRaw;

    file.rawLength = data?.rawLength;

    file.syntaxFile = data?.syntaxFile || {};

    file.hasDoSyntax = data?.hasDoSyntax;

    file.syntaxLength = data?.syntaxLength;

    file.highlighterName = data?.highlighterName;

    file.highlighterType = data?.highlighterType;

    file.maxLineNumber = data?.maxLineNumber;

    return file;
  }

  constructor(row: string, lang: DiffHighlighterLang, fileName?: string);
  constructor(row: string, lang: string, fileName?: string);
  constructor(
    public raw: string,
    readonly lang: DiffHighlighterLang | string,
    readonly fileName?: string
  ) {
    this.raw = processTransformForFile(raw);

    Object.defineProperty(this, "__v_skip", { value: true });
  }

  doSyntax({
    registerHighlighter,
    theme,
  }: {
    registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
    theme?: "light" | "dark";
  }) {
    if (!this.raw) return;

    const finalHighlighter = registerHighlighter || _defaultHighlighter;

    if (!finalHighlighter) {
      if (__DEV__) {
        console.warn(
          "[@git-diff-view/core] No syntax highlighter available. Import @git-diff-view/lowlight or provide a registerHighlighter."
        );
      }
      return;
    }

    if (this.rawLength > finalHighlighter.maxLineToIgnoreSyntax) {
      if (__DEV__) {
        console.warn(
          `[@git-diff-view/core] Ignoring syntax highlighting for the current file as the raw length exceeds the threshold: ${this.rawLength}`
        );
      }
      return;
    }

    // check current lang is support or not
    // if it's a unsupported lang, fallback to use the default highlighter
    let supportEngin = finalHighlighter;

    try {
      if (!finalHighlighter.hasRegisteredCurrentLang(this.lang)) {
        supportEngin = _defaultHighlighter || finalHighlighter;
      }
    } catch {
      supportEngin = _defaultHighlighter || finalHighlighter;
    }

    if (
      this.hasDoSyntax &&
      supportEngin.name === this.highlighterName &&
      supportEngin.type === this.highlighterType &&
      (this.theme === theme || supportEngin.type === "class")
    )
      return;

    this.ast = supportEngin.getAST(this.raw, this.fileName, this.lang, theme);

    this.theme = theme;

    if (!this.ast) return;

    const { syntaxFileObject, syntaxFileLineNumber } = supportEngin.processAST(this.ast);

    // get syntax template
    Object.values(syntaxFileObject).forEach((line: SyntaxLineWithTemplate) => {
      line.template = getSyntaxLineTemplate(line);
    });

    this.syntaxFile = syntaxFileObject;

    this.syntaxLength = syntaxFileLineNumber;

    this.highlighterName = supportEngin.name;

    this.highlighterType = supportEngin.type;

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

    this.plainFile = {};

    for (let i = 0; i < rawArray.length; i++) {
      this.rawFile[i + 1] = i < rawArray.length - 1 ? rawArray[i] + "\n" : rawArray[i];
      this.plainFile[i + 1] = {
        value: this.rawFile[i + 1],
        template: getPlainLineTemplate(this.rawFile[i + 1]),
      };
    }

    this.hasDoRaw = true;
  }

  #doCheck() {
    if (this.rawLength && this.syntaxLength) {
      if (this.rawLength !== this.syntaxLength) {
        console.warn("[@git-diff-view/core] The rawLength does not match the syntaxLength.");
      }
      Object.values(this.syntaxFile).forEach(({ value, lineNumber }) => {
        if (value !== this.rawFile[lineNumber]) {
          console.warn(
            "[@git-diff-view/core] Content mismatch detected at line " +
              lineNumber +
              ": " +
              value +
              " !== " +
              this.rawFile[lineNumber]
          );
        }
      });
    }
  }
}

// TODO add highlight engine key to cache key
export function getFile(
  raw: string,
  lang: DiffHighlighterLang,
  theme: "light" | "dark",
  fileName?: string,
  uuid?: string
): File;
export function getFile(raw: string, lang: string, theme: "light" | "dark", fileName?: string, uuid?: string): File;
export function getFile(
  raw: string,
  lang: DiffHighlighterLang | string,
  theme: "light" | "dark",
  fileName?: string,
  uuid?: string
) {
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
    // 基于className的ast不需要重新生成
    if (cacheFile.highlighterType === "class") {
      return cacheFile;
    }
  }

  const file = new File(raw, lang, fileName);

  map.set(key, file);

  return file;
}

export const _cacheMap = map;

export const disableCache = () => map.setMaxLength(0);
