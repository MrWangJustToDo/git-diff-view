import { generateDiffFile } from "@git-diff-view/file";
import { getDiffViewHighlighter } from "@git-diff-view/shiki";
import { Box, render, Text } from "ink";
import { createElement } from "react";

import { DiffView, DiffModeEnum } from "@git-diff-view/cli";

export const temp1 = `import { processAST, DiffHighlighter } from '@git-diff-view/core';
import githubLight from 'shiki/themes/github-light.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import getWasm from 'shiki/wasm';
// import a from 'shiki/langs/angular-ts.mjs';
// import b from 'shiki/langs/astro.mjs';
import c from 'shiki/langs/bat.mjs';
import d from 'shiki/langs/c.mjs';
import e from 'shiki/langs/cmake.mjs';
import f from 'shiki/langs/cpp.mjs';
import g from 'shiki/langs/vue.mjs';
import h from 'shiki/langs/css.mjs';
// import i from 'shiki/langs/csv.mjs';
// import j from 'shiki/langs/dart.mjs';
    /*
  import k from 'shiki/langs/diff.mjs';
  import l from 'shiki/langs/docker.mjs';
    */
import m from 'shiki/langs/go.mjs';
import n from 'shiki/langs/python.mjs';
import o from 'shiki/langs/java.mjs';
import p from 'shiki/langs/javascript.mjs';
import q from 'shiki/langs/typescript.mjs';
import r from 'shiki/langs/html.mjs';
import s from 'shiki/langs/xml.mjs';
// import t from 'shiki/langs/yaml.mjs';
import u from 'shiki/langs/json.mjs';
import v from 'shiki/langs/jsx.mjs';
import w from 'shiki/langs/tsx.mjs';
import x from 'shiki/langs/less.mjs';
import y from 'shiki/langs/sass.mjs';
import z from 'shiki/langs/scss.mjs';
import z1 from 'shiki/langs/sql.mjs';
// import z2 from '@shikijs/langs/swift';
// import z3 from '@shikijs/langs/svelte';
// import z4 from '@shikijs/langs/postcss';
// import z5 from '@shikijs/langs/kotlin';
// import z6 from '@shikijs/langs/make';
import z7 from 'shiki/langs/markdown.mjs';
// import z8 from 'shiki/langs/mdx.mjs';
// import z9 from 'shiki/langs/php.mjs';
// import za from 'shiki/langs/ruby.mjs';
// import zb from 'shiki/langs/rust.mjs';
// import zc from 'shiki/langs/nginx.mjs';
// import zd from 'shiki/langs/objective-c.mjs';
// import ze from 'shiki/langs/objective-cpp.mjs';
import { createHighlighterCore, createJavaScriptRegexEngine } from 'shiki';
import type { codeToHast } from 'shiki';

// 更高质量的语法高亮引擎
// SEE https://shiki.style/
// SEE https://github.com/MrWangJustToDo/git-diff-view/tree/main/packages/shiki

// 为了兼容现有的微应用架构，将所有需要的资源统一打包而不是按需加载
const shikiHighlighter = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [
    // a,
    // b,
    c,
    d,
    e,
    f,
    g,
    h,
    // i,
    // j,
    // k,
    // l,
    m,
    n,
    o,
    p,
    q,
    r,
    s,
    // t,
    u,
    v,
    w,
    x,
    y,
    z,
    z1,
    // z2,
    // z3,
    // z4,
    // z5,
    // z6,
    z7,
    // z8,
    // z9,
    // za,
    // zb,
    // zc,
    // zd,
    // ze,
  ],
  loadWasm: getWasm,
});

type DePromise<T> = T extends Promise<infer U> ? DePromise<U> : T;

export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;

let internal: DePromise<ReturnType<typeof createHighlighterCore>> | null = null;

const instance = { name: 'shiki' };

let _maxLineToIgnoreSyntax = 2000;

const _ignoreSyntaxHighlightList: (string | RegExp)[] = [];

Object.defineProperty(instance, 'maxLineToIgnoreSyntax', {
  get: () => _maxLineToIgnoreSyntax,
});

Object.defineProperty(instance, 'setMaxLineToIgnoreSyntax', {
  value: (v: number) => {
    _maxLineToIgnoreSyntax = v;
  },
});

Object.defineProperty(instance, 'ignoreSyntaxHighlightList', {
  get: () => _ignoreSyntaxHighlightList,
});

Object.defineProperty(instance, 'setIgnoreSyntaxHighlightList', {
  value: (v: (string | RegExp)[]) => {
    _ignoreSyntaxHighlightList.length = 0;
    _ignoreSyntaxHighlightList.push(...v);
  },
});

Object.defineProperty(instance, 'getAST', {
  value: (raw: string, fileName?: string, lang?: string) => {
    if (
      fileName &&
      highlighter.ignoreSyntaxHighlightList.some((item) => (item instanceof RegExp ? item.test(fileName) : fileName === item))
    ) {
      return;
    }

    try {
      // @ts-ignore
      return internal?.codeToHast(raw, {
        lang: lang!,
        themes: {
          dark: githubDark,
          light: githubLight,
        },
        defaultColor: false,
        cssVariablePrefix: '--diff-view-',
        mergeWhitespaces: false,
        // TODO 提供额外的配置来控制加载插件
        // transformers: [shikiColorizedBrackets()],
      });
    } catch (e) {
      console.log((e as Error).message);
      return;
    }
  },
});

Object.defineProperty(instance, 'processAST', {
  value: (ast: DiffAST) => {
    return processAST(ast);
  },
});

Object.defineProperty(instance, 'hasRegisteredCurrentLang', {
  value: (lang: string) => {
    return internal?.getLanguage(lang) !== undefined;
  },
});

Object.defineProperty(instance, 'getHighlighterEngine', {
  value: () => {
    return internal;
  },
});

Object.defineProperty(instance, 'type', {
  value: 'class',
});

const highlighter: DiffHighlighter = instance as DiffHighlighter;

export const highlighterReady = new Promise<DiffHighlighter>((r) => {
  if (internal) {
    r(highlighter);
  } else {
    shikiHighlighter
      .then((i) => {
        internal = i;
      })
      .then(() => r(highlighter));
  }
});
`;

export const temp2 = `import { processAST, DiffHighlighter } from '@git-diff-view/core';
import githubLight from 'shiki/themes/github-light.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import getWasm from 'shiki/wasm';
// import a from 'shiki/langs/angular-ts.mjs';
// import b from 'shiki/langs/astro.mjs';
import c from 'shiki/langs/bat.mjs';
import d from 'shiki/langs/c.mjs';
import e from 'shiki/langs/cmake.mjs';
import f from 'shiki/langs/cpp.mjs';
import g from 'shiki/langs/vue.mjs';
import h from 'shiki/langs/css.mjs';
// import i from 'shiki/langs/csv.mjs';
import j from 'shiki/langs/dart.mjs';
  //
// import k from 'shiki/langs/diff.mjs';
// import l from 'shiki/langs/docker.mjs';
  //
import m from 'shiki/langs/go.mjs';
import n from 'shiki/langs/python.mjs';
import o from 'shiki/langs/java.mjs';
import p from 'shiki/langs/javascript.mjs';
import q from 'shiki/langs/typescript.mjs';
import r from 'shiki/langs/html.mjs';
import s from 'shiki/langs/xml.mjs';
// import t from 'shiki/langs/yaml.mjs';
import u from 'shiki/langs/json.mjs';
import v from 'shiki/langs/jsx.mjs';
import w from 'shiki/langs/tsx.mjs';
import x from 'shiki/langs/less.mjs';
import y from 'shiki/langs/sass.mjs';
import z from 'shiki/langs/scss.mjs';
import z1 from 'shiki/langs/sql.mjs';
import z2 from 'shiki/langs/swift.mjs';
import z3 from 'shiki/langs/svelte.mjs';
// import z4 from 'shiki/langs/postcss.mjs';
import z5 from 'shiki/langs/kotlin.mjs';
// import z6 from 'shiki/langs/make.mjs';
import z7 from 'shiki/langs/markdown.mjs';
// import z8 from 'shiki/langs/mdx.mjs';
// import z9 from 'shiki/langs/php.mjs';
// import za from 'shiki/langs/ruby.mjs';
// import zb from 'shiki/langs/rust.mjs';
// import zc from 'shiki/langs/nginx.mjs';
import zd from 'shiki/langs/objective-c.mjs';
import ze from 'shiki/langs/objective-cpp.mjs';
import { createHighlighterCore, createJavaScriptRegexEngine } from 'shiki';
import type { codeToHast } from 'shiki';

// 更高质量的语法高亮引擎
// SEE https://shiki.style/
// SEE https://github.com/MrWangJustToDo/git-diff-view/tree/main/packages/shiki

// 为了兼容现有的微应用架构，将所有需要的资源统一打包而不是按需加载
const shikiHighlighter = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [
    // a,
    // b,
    c,
    d,
    e,
    f,
    g,
    h,
    // i,
    j,
    // k,
    // l,
    m,
    n,
    o,
    p,
    q,
    r,
    s,
    // t,
    u,
    v,
    w,
    x,
    y,
    z,
    z1,
    z2,
    z3,
    // z4,
    z5,
    // z6,
    z7,
    // z8,
    // z9,
    // za,
    // zb,
    // zc,
    zd,
    ze,
  ],
  loadWasm: getWasm,
});

type DePromise<T> = T extends Promise<infer U> ? DePromise<U> : T;

export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;

let internal: DePromise<ReturnType<typeof createHighlighterCore>> | null = null;

const instance = { name: 'shiki' };

let _maxLineToIgnoreSyntax = 2000;

const _ignoreSyntaxHighlightList: (string | RegExp)[] = [];

Object.defineProperty(instance, 'maxLineToIgnoreSyntax', {
  get: () => _maxLineToIgnoreSyntax,
});

Object.defineProperty(instance, 'setMaxLineToIgnoreSyntax', {
  value: (v: number) => {
    _maxLineToIgnoreSyntax = v;
  },
});

Object.defineProperty(instance, 'ignoreSyntaxHighlightList', {
  get: () => _ignoreSyntaxHighlightList,
});

Object.defineProperty(instance, 'setIgnoreSyntaxHighlightList', {
  value: (v: (string | RegExp)[]) => {
    _ignoreSyntaxHighlightList.length = 0;
    _ignoreSyntaxHighlightList.push(...v);
  },
});

Object.defineProperty(instance, 'getAST', {
  value: (raw: string, fileName?: string, lang?: string) => {
    if (
      fileName &&
      highlighter.ignoreSyntaxHighlightList.some((item) => (item instanceof RegExp ? item.test(fileName) : fileName === item))
    ) {
      return;
    }

    try {
      // @ts-ignore
      return internal?.codeToHast(raw, {
        lang: lang!,
        themes: {
          dark: githubDark,
          light: githubLight,
        },
        defaultColor: false,
        cssVariablePrefix: '--diff-view-',
        mergeWhitespaces: false,
        // TODO 提供额外的配置来控制加载插件
        // transformers: [shikiColorizedBrackets()],
      });
    } catch (e) {
      console.log((e as Error).message);
      return;
    }
  },
});

Object.defineProperty(instance, 'processAST', {
  value: (ast: DiffAST) => {
    return processAST(ast);
  },
});

Object.defineProperty(instance, 'hasRegisteredCurrentLang', {
  value: (lang: string) => {
    return internal?.getLanguage(lang) !== undefined;
  },
});

Object.defineProperty(instance, 'getHighlighterEngine', {
  value: () => {
    return internal;
  },
});

Object.defineProperty(instance, 'type', {
  value: 'class',
});

const highlighter: DiffHighlighter = instance as DiffHighlighter;

export const highlighterReady = new Promise<DiffHighlighter>((r) => {
  if (internal) {
    r(highlighter);
  } else {
    shikiHighlighter
      .then((i) => {
        internal = i;
      })
      .then(() => r(highlighter));
  }
});`;

const diffFile = generateDiffFile("", temp1, "", temp2, "javascript", "javascript");

diffFile.initRaw();

getDiffViewHighlighter().then((highlighter) => {
  render(
    createElement(DiffView, {
      diffFile,
      // width: 80,
      diffViewTheme: "dark",
      // diffViewTabWidth: 'small',
      diffViewTabSpace: true,
      extendData: {
        newFile: { 107: { data: "test extend data" } },
      },
      renderExtendLine: ({ data }) => {
        return createElement(
          Box,
          { backgroundColor: "red", width: "100%", padding: "1" },
          createElement(Text, null, data)
        );
      },
      diffViewHighlight: true,
      registerHighlighter: highlighter,
      diffViewMode: DiffModeEnum.Split,
    })
  );
});
