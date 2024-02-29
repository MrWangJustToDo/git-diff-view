import { Cache } from "./cache";
import { highlighter } from "./highlighter";

import type { AST } from "./highlighter";

const map = new Cache<string, File>();

map.setMaxLength(50);

if (__DEV__ && typeof globalThis !== "undefined") {
  if (typeof globalThis.__diff_cache__ === "object") {
    console.warn("there are multiple version of @git-diff-view/core in the one environment!");
  }
  globalThis.__diff_cache__ = map;
}

export type SyntaxNode = {
  type: string;
  value: string;
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  properties?: { className?: string[] };
  children?: SyntaxNode[];
};

export type SyntaxLine = {
  value: string;
  lineNumber: number;
  valueLength: number;
  nodeList: { node: SyntaxNode; wrapper?: SyntaxNode }[];
};

export class File {
  ast?: AST;

  rawFile: Record<number, string> = {};

  hasDoRaw: boolean = false;

  rawLength?: number;

  syntaxFile: Record<number, SyntaxLine> = {};

  hasDoSyntax: boolean = false;

  syntaxLength?: number;

  maxLineNumber: number = 0;

  constructor(
    readonly raw: string,
    readonly lang: string,
    readonly fileName?: string
  ) {
    Object.defineProperty(this, "__v_skip", { value: true });
  }

  doSyntax({
    autoDetectLang,
    registerHighlighter,
  }: {
    autoDetectLang?: boolean;
    registerHighlighter?: typeof highlighter;
  }) {
    if (!this.raw || this.hasDoSyntax) return;

    let hasRegisteredLang = true;

    const _highlighter = registerHighlighter || highlighter;

    if (this.syntaxLength) {
      __DEV__ && console.error("current file already doSyntax before!");
      return;
    }

    if (!_highlighter.registered(this.lang)) {
      hasRegisteredLang = false;
      if (!autoDetectLang) {
        __DEV__ && console.warn(`not support current lang: ${this.lang} yet`);
        return;
      }
    }

    if (this.rawLength > _highlighter.maxLineToIgnoreSyntax) {
      __DEV__ && console.warn(`ignore syntax for current file, because the rawLength is too long: ${this.rawLength}`);
      return;
    }

    if (
      this.fileName &&
      _highlighter.ignoreSyntaxHighlightList.some((item) =>
        item instanceof RegExp ? item.test(this.fileName) : this.fileName === item
      )
    ) {
      __DEV__ &&
        console.warn(
          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${this.fileName}`
        );
      return;
    }

    if (hasRegisteredLang) {
      this.ast = _highlighter.highlight(this.lang, this.raw);
    } else {
      this.ast = _highlighter.highlightAuto(this.raw);
    }

    this.#doAST();

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

  #doAST() {
    const ast = this.ast!;

    let lineNumber = 1;

    const syntaxObj = this.syntaxFile;

    const loopAST = (nodes: SyntaxNode[], wrapper?: SyntaxNode) => {
      nodes.forEach((node) => {
        if (node.type === "text") {
          if (node.value.indexOf("\n") === -1) {
            const valueLength = node.value.length;
            if (!syntaxObj[lineNumber]) {
              node.startIndex = 0;
              node.endIndex = valueLength - 1;
              const item = {
                value: node.value,
                lineNumber,
                valueLength,
                nodeList: [{ node, wrapper }],
              };
              syntaxObj[lineNumber] = item;
            } else {
              node.startIndex = syntaxObj[lineNumber].valueLength;
              node.endIndex = node.startIndex + valueLength - 1;
              syntaxObj[lineNumber].value += node.value;
              syntaxObj[lineNumber].valueLength += valueLength;
              syntaxObj[lineNumber].nodeList.push({ node, wrapper });
            }
            node.lineNumber = lineNumber;
            return;
          }

          const lines = node.value.split("\n");
          node.children = node.children || [];
          for (let i = 0; i < lines.length; i++) {
            const _value = i === lines.length - 1 ? lines[i] : lines[i] + "\n";
            const _lineNumber = i === 0 ? lineNumber : ++lineNumber;
            const _valueLength = _value.length;
            const _node: SyntaxNode = {
              type: "text",
              value: _value,
              startIndex: Infinity,
              endIndex: Infinity,
              lineNumber: _lineNumber,
            };
            if (!syntaxObj[_lineNumber]) {
              _node.startIndex = 0;
              _node.endIndex = _valueLength - 1;
              const item = {
                value: _value,
                lineNumber: _lineNumber,
                valueLength: _valueLength,
                nodeList: [{ node: _node, wrapper }],
              };
              syntaxObj[_lineNumber] = item;
            } else {
              _node.startIndex = syntaxObj[_lineNumber].valueLength;
              _node.endIndex = _node.startIndex + _valueLength - 1;
              syntaxObj[_lineNumber].value += _value;
              syntaxObj[_lineNumber].valueLength += _valueLength;
              syntaxObj[_lineNumber].nodeList.push({ node: _node, wrapper });
            }
            node.children.push(_node);
          }

          node.lineNumber = lineNumber;

          return;
        }
        if (node.children) {
          loopAST(node.children, node);

          node.lineNumber = lineNumber;
        }
      });
    };

    loopAST(ast.children as SyntaxNode[]);

    this.syntaxLength = lineNumber;
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

export const getFile = (raw: string, lang: string, fileName?: string) => {
  const key = raw + "--" + __VERSION__ + "--" + lang;

  if (map.has(key)) return map.get(key);

  const file = new File(raw, lang, fileName);

  map.set(key, file);

  return file;
};
