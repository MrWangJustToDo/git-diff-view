import { highlighter } from "./highlighter";

import type { ATS } from "./highlighter";

// TODO LRU Cache
const map = {} as Record<string, File>;

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
  ast?: ATS;

  rawFile: Record<number, string> = {};

  hasDoRaw: boolean = false;

  rawLength?: number;

  syntaxFile: Record<number, SyntaxLine> = {};

  hasDoSyntax: boolean = false;

  syntaxLength?: number;

  maxLineNumber: number = 0;

  constructor(
    readonly raw: string,
    readonly lang: string
  ) {}

  doSyntax() {
    if (!this.raw || this.hasDoSyntax) return;

    if (!this.rawLength) {
      console.error("current file is empty" + this.raw);
      return;
    }

    if (this.syntaxLength) {
      console.error("current file already doSyntax before!");
      return;
    }

    if (!highlighter.registered(this.lang)) {
      console.warn(`not support current lang: ${this.lang} yet`);
      return;
    }

    const ast = highlighter.highlight(this.lang, this.raw);

    this.ast = ast;

    this.#doAST();

    this.#doCheck();

    this.hasDoSyntax = true;
  }

  doRaw() {
    if (!this.raw || this.hasDoRaw) return;

    const rawString = this.raw;

    const rawArray = rawString.split("\n");

    this.rawLength = rawArray.length - 1;

    this.maxLineNumber = rawArray.length + 1;

    this.rawFile = rawArray.reduce(
      (p, item, index) => ({
        ...p,
        [index + 1]: index < rawArray.length - 1 ? item + "\n" : item,
      }),
      {}
    );

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
              syntaxObj[lineNumber] = {
                value: node.value,
                lineNumber,
                valueLength,
                nodeList: [{ node, wrapper }],
              };
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
              syntaxObj[_lineNumber] = {
                value: _value,
                lineNumber: _lineNumber,
                valueLength: _valueLength,
                nodeList: [{ node: _node, wrapper }],
              };
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

    this.syntaxLength = lineNumber - 1;
  }

  #doCheck() {
    if (this.rawLength && this.syntaxLength) {
      if (this.rawLength !== this.syntaxLength) {
        console.warn("the rawLength not match for the syntaxLength");
      }
      Object.values(this.syntaxFile).forEach(({ value, lineNumber }) => {
        if (value !== this.rawFile[lineNumber]) {
          console.log("some line not match:" + value + " __ " + this.rawFile[lineNumber] + " __ at: " + lineNumber + " lineNumber");
        }
      });
    }
  }
}

export const getFile = (raw: string, lang: string) => {
  const key = raw + "--" + __VERSION__ + "--" + lang;

  if (map[key]) return map[key];

  const file = new File(raw, lang);

  map[key] = file;

  return file;
};
