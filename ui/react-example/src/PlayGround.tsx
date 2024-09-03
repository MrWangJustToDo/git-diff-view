import { DiffView, DiffFile } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./components/Button";

const temp =
  'diff --git a/packages/myreact-reactivity/src/reactive/feature.ts b/packages/myreact-reactivity/src/reactive/feature.ts\nindex 5b301628..15aac42f 100644\n--- a/packages/myreact-reactivity/src/reactive/feature.ts\n+++ b/packages/myreact-reactivity/src/reactive/feature.ts\n@@ -74,7 +74,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n \n     componentWillUnmount(): void {\n       this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n     shouldComponentUpdate(): boolean {\n@@ -84,7 +84,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n       return true;\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -92,7 +92,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.effect.run() });\n+      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n     }\n   }\n \n@@ -104,10 +104,10 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     } & P\n   > {\n     componentWillUnmount(): void {\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -115,7 +115,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return this.effect.run();\n+      return this.reactiveEffect.run();\n     }\n   }\n';

const rawTemp =
  'import { Component, createElement, useState, useCallback, useMemo } from "@my-react/react";\n\nimport { proxyRefs, ReactiveEffect } from "../api";\n\nimport type { UnwrapRef } from "../api";\nimport type { LikeReactNode } from "@my-react/react";\n\ntype LifeCycle = {\n  onBeforeMount: Array<() => void>;\n\n  onMounted: Array<() => void>;\n\n  onBeforeUpdate: Array<() => void>;\n\n  onUpdated: Array<() => void>;\n\n  onBeforeUnmount: Array<() => void>;\n\n  onUnmounted: Array<() => void>;\n\n  hasHookInstalled: boolean;\n\n  canUpdateComponent: boolean;\n};\n\n/**\n * @internal\n */\nexport let globalInstance: LifeCycle | null = null;\n\nexport function createReactive<P extends Record<string, unknown>, S extends Record<string, unknown>>(props?: {\n  setup: () => S;\n  render?: (props: UnwrapRef<S> & P) => LikeReactNode;\n}) {\n  const setup = typeof props === "function" ? props : props.setup;\n\n  const render = typeof props === "function" ? null : props.render;\n\n  class ForBeforeUnmount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onBeforeUnmount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class ForBeforeMount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onBeforeMount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class RenderWithLifeCycle extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__instance__$$"]: LifeCycle;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onMounted.forEach((f) => f());\n    }\n\n    componentDidUpdate(): void {\n      this.props.$$__instance__$$.onUpdated.forEach((f) => f());\n    }\n\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n      this.reactiveEffect.stop();\n    }\n\n    shouldComponentUpdate(): boolean {\n      this.props.$$__instance__$$.canUpdateComponent = false;\n      this.props.$$__instance__$$.onBeforeUpdate.forEach((f) => f());\n      this.props.$$__instance__$$.canUpdateComponent = true;\n      return true;\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n    }\n  }\n\n  class Render extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentWillUnmount(): void {\n      this.reactiveEffect.stop();\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return this.reactiveEffect.run();\n    }\n  }\n\n  const MyReactReactiveComponent = (props: P & { children?: (props: UnwrapRef<S> & P) => LikeReactNode }) => {\n    const [instance] = useState(() => ({\n      onBeforeMount: [],\n      onBeforeUpdate: [],\n      onBeforeUnmount: [],\n      onMounted: [],\n      onUpdated: [],\n      onUnmounted: [],\n      hasHookInstalled: false,\n      canUpdateComponent: true,\n    }));\n\n    const state = useMemo(() => {\n      globalInstance = instance;\n\n      const state = proxyRefs(setup());\n\n      globalInstance = null;\n\n      return state;\n    }, []);\n\n    if (__DEV__) {\n      for (const key in props) {\n        if (key in state) {\n          console.warn(`duplicate key ${key} in Component props and reactive state, please fix this usage`);\n        }\n      }\n      if (props["children"] && typeof props["children"] !== "function") {\n        throw new Error("the component which return from createReactive() expect a function children");\n      }\n    }\n\n    const [, setState] = useState(() => 0);\n\n    const updateCallback = useCallback(() => {\n      if (instance.canUpdateComponent) {\n        setState((i) => i + 1);\n      }\n    }, []);\n\n    if (instance.hasHookInstalled) {\n      return createElement(ForBeforeUnmount, {\n        ["$$__instance__$$"]: instance,\n        children: createElement(RenderWithLifeCycle, {\n          ...props,\n          ["$$__trigger__$$"]: updateCallback,\n          ["$$__reactiveState__$$"]: state,\n          ["$$__instance__$$"]: instance,\n        }),\n      }) as LikeReactNode;\n    } else {\n      return createElement(Render, { ...props, ["$$__trigger__$$"]: updateCallback, ["$$__reactiveState__$$"]: state }) as LikeReactNode;\n    }\n  };\n\n  return MyReactReactiveComponent;\n}\n';

const _PlayGroundGitDiff = ({ onClick }: { onClick: () => void }) => {
  const [lang, setLang] = useState("ts");

  const [diffInstance, setDiffInstance] = useState<DiffFile>();

  const [diffString, setDiffString] = useState(temp);

  const [content, setContent] = useState(rawTemp);

  const setDiffInstanceCb = useCallback(
    debounce((lang, diffString, content) => {
      if (!diffString) {
        setDiffInstance(undefined);
        return;
      }
      const data = DiffFile.createInstance({
        newFile: { fileName: "new", fileLang: lang, content: content },
        hunks: [diffString],
      });
      try {
        data?.init();
        data?.buildSplitDiffLines();
        setDiffInstance(data);
      } catch (e) {
        alert((e as Error).message);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    setDiffInstanceCb(lang, diffString, content);
  }, [diffString, content, lang]);

  return (
    <div className="m-auto mb-[1em] mt-[1em] w-[90%]">
      <h2 className="text-[24px]">
        PlayGround -- provide a `git diff` string
        <div className="ml-4 inline-block text-[14px]">
          <Button onClick={onClick}>go to `file mode`</Button>
        </div>
      </h2>
      <div className="mt-[10px] flex flex-col gap-y-[10px]">
        <span className="border-b p-[3px]">Lang: </span>
        <input
          className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
          type=""
          placeholder="input syntax lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        />
        <span className="border-b p-[3px]">`git diff`: </span>
        <textarea
          cols={10}
          rows={5}
          autoFocus
          className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
          placeholder="give a `git diff` output"
          value={diffString}
          onChange={(e) => setDiffString(e.target.value)}
        />
        <span className="border-b p-[3px]">Original file content (optional): </span>
        <textarea
          cols={10}
          rows={5}
          className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
          placeholder="give a raw file content (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {diffInstance ? (
        <DiffView<string>
          className="mt-[10px] overflow-hidden rounded-[4px] border"
          diffFile={diffInstance}
          diffViewFontSize={13}
          // diffViewTheme="github-dark"
          diffViewHighlight={true}
          diffViewWrap
        />
      ) : (
        <div className="mt-[10px] rounded-[4px] border p-[10px] text-[22px] text-orange-500">Empty</div>
      )}
    </div>
  );
};

const _PlayGroundFileDiff = ({ onClick }: { onClick: () => void }) => {
  const [lang1, setLang1] = useState("ts");

  const [lang2, setLang2] = useState("ts");

  const [file1, setFile1] = useState(
    'import { createLowlight, all } from "lowlight";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nconst lowlight = createLowlight(all);\n\n// !SEE https://github.com/highlightjs/highlightjs-vue\n\nlowlight.register("vue", function hljsDefineVue(hljs) {\n  return {\n    subLanguage: "xml",\n    contains: [\n      hljs.COMMENT("\x3C!--", "-->", {\n        relevance: 10,\n      }),\n      {\n        begin: /^(\\s*)(\x3Cscript>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "javascript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:\x3Cscript\\s+lang=(["\'])ts\\1>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "typescript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(\\s*)(<style(\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "css",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])(?:s[ca]ss)\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "scss",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])stylus\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "stylus",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n    ],\n  };\n});\n\nexport type DiffAST = ReturnType<typeof lowlight.highlight>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => typeof lowlight;\n};\n\nconst instance = { name: "lowlight" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});\n\nObject.defineProperty(instance, "ignoreSyntaxHighlightList", {\n  get: () => _ignoreSyntaxHighlightList,\n});\n\nObject.defineProperty(instance, "setIgnoreSyntaxHighlightList", {\n  value: (v: (string | RegExp)[]) => {\n    _ignoreSyntaxHighlightList.length = 0;\n    _ignoreSyntaxHighlightList.push(...v);\n  },\n});\n\nObject.defineProperty(instance, "getAST", {\n  value: (raw: string, fileName?: string, lang?: string) => {\n    let hasRegisteredLang = true;\n\n    if (!lowlight.registered(lang)) {\n      __DEV__ && console.warn(`not support current lang: ${lang} yet`);\n      hasRegisteredLang = false;\n    }\n\n    if (\n      fileName &&\n      highlighter.ignoreSyntaxHighlightList.some((item) =>\n        item instanceof RegExp ? item.test(fileName) : fileName === item\n      )\n    ) {\n      __DEV__ &&\n        console.warn(\n          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`\n        );\n      return;\n    }\n\n    if (hasRegisteredLang) {\n      return lowlight.highlight(lang, raw);\n    } else {\n      return lowlight.highlightAuto(raw);\n    }\n  },\n});\n\nObject.defineProperty(instance, "processAST", {\n  value: (ast: DiffAST) => {\n    return processAST(ast);\n  },\n});\n\nObject.defineProperty(instance, "hasRegisteredCurrentLang", {\n  value: (lang: string) => {\n    return lowlight.registered(lang);\n  },\n});\n\nexport { processAST } from "./processAST";\n\nexport const versions = __VERSION__;\n\nexport const highlighter: DiffHighlighter = instance as DiffHighlighter;\n'
  );

  const [file2, setFile2] = useState(
    'import { getHighlighter } from "shiki";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nimport type { codeToHast } from "shiki";\n\nexport type DiffAST = DePromise<ReturnType<typeof codeToHast>>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;\n};\n\nlet internal: DePromise<ReturnType<typeof getHighlighter>> | null = null;\n\nconst getDefaultHighlighter = async () =>\n  await getHighlighter({\n    themes: ["github-light", "github-dark"],\n    langs: [\n      "cpp",\n      "java",\n      "javascript",\n      "css",\n      "c#",\n      "c",\n      "c++",\n      "vue",\n      "vue-html",\n      "astro",\n      "bash",\n      "make",\n      "markdown",\n      "makefile",\n      "bat",\n      "cmake",\n      "cmd",\n      "csv",\n      "docker",\n      "dockerfile",\n      "go",\n      "python",\n      "html",\n      "jsx",\n      "tsx",\n      "typescript",\n      "sql",\n      "xml",\n      "sass",\n      "ssh-config",\n      "kotlin",\n      "json",\n      "swift",\n      "txt",\n      "diff",\n    ],\n  });\n\nconst instance = { name: "shiki" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});\n\nObject.defineProperty(instance, "ignoreSyntaxHighlightList", {\n  get: () => _ignoreSyntaxHighlightList,\n});\n\nObject.defineProperty(instance, "setIgnoreSyntaxHighlightList", {\n  value: (v: (string | RegExp)[]) => {\n    _ignoreSyntaxHighlightList.length = 0;\n    _ignoreSyntaxHighlightList.push(...v);\n  },\n});\n\nObject.defineProperty(instance, "getAST", {\n  value: (raw: string, fileName?: string, lang?: string) => {\n    if (\n      fileName &&\n      highlighter.ignoreSyntaxHighlightList.some((item) =>\n        item instanceof RegExp ? item.test(fileName) : fileName === item\n      )\n    ) {\n      __DEV__ &&\n        console.warn(\n          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`\n        );\n      return;\n    }\n\n    try {\n      return internal?.codeToHast(raw, { lang: lang, theme: "github-light", mergeWhitespaces: false });\n    } catch (e) {\n      if (__DEV__) {\n        console.error(e);\n      } else {\n        console.log((e as Error).message);\n      }\n      return;\n    }\n  },\n});\n\nObject.defineProperty(instance, "processAST", {\n  value: (ast: DiffAST) => {\n    return processAST(ast);\n  },\n});\n\nObject.defineProperty(instance, "hasRegisteredCurrentLang", {\n  value: (lang: string) => {\n    return internal?.getLanguage(lang) !== undefined;\n  },\n});\n\nObject.defineProperty(instance, "getHighlighterEngine", {\n  value: () => {\n    return internal;\n  },\n});\n\nconst highlighter: DiffHighlighter = instance as DiffHighlighter;\n\nexport const highlighterReady = new Promise<DiffHighlighter>((r) => {\n  if (internal) {\n    r(highlighter);\n  } else {\n    getDefaultHighlighter()\n      .then((i) => {\n        internal = i;\n      })\n      .then(() => r(highlighter));\n  }\n});\n\nexport { processAST } from "./processAST";\n\nexport const versions = __VERSION__;\n\nexport * from "shiki";\n'
  );

  const [diffInstance, setDiffInstance] = useState<DiffFile>();

  const setDiffInstanceCb = useCallback(
    debounce((lang1, lang2, file1, file2) => {
      if (!file1 && !file2) {
        setDiffInstance(undefined);
        return;
      }
      const data = generateDiffFile(`foo.${lang1}`, file1, `foo.${lang2}`, file2);
      try {
        data?.init();
        data?.buildSplitDiffLines();
        setDiffInstance(data);
      } catch (e) {
        alert((e as Error).message);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    setDiffInstanceCb(lang1, lang2, file1, file2);
  }, [file1, file2, lang1, lang2]);

  return (
    <div className="m-auto mb-[1em] mt-[1em] w-[90%]">
      <h2 className="text-[24px]">
        PlayGround -- provide two file content
        <div className="ml-4 inline-block text-[14px]">
          <Button onClick={onClick}>go to `git mode`</Button>
        </div>
      </h2>
      <div className="mt-[10px] flex gap-x-[10px]">
        <div className="flex w-[50%] flex-col">
          <span className="border-b p-[3px]">lang: </span>
          <input
            className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
            type=""
            placeholder="input syntax lang"
            value={lang1}
            onChange={(e) => setLang1(e.target.value)}
          />
          <span className="border-b p-[3px]">file 1: </span>
          <textarea
            cols={10}
            rows={5}
            autoFocus
            className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
            placeholder="provider a file content"
            value={file1}
            onChange={(e) => setFile1(e.target.value)}
          />
        </div>
        <div className="flex w-[50%] flex-col">
          <span className="border-b p-[3px]">lang: </span>
          <input
            className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
            type=""
            placeholder="input syntax lang"
            value={lang2}
            onChange={(e) => setLang2(e.target.value)}
          />
          <span className="border-b p-[3px]">file 2: </span>
          <textarea
            cols={10}
            rows={5}
            autoFocus
            className="rounded-[4px] border-2 border-[#888] p-[4px] text-[14px]"
            placeholder="provider a file content"
            value={file2}
            onChange={(e) => setFile2(e.target.value)}
          />
        </div>
      </div>

      {diffInstance ? (
        <DiffView<string>
          className="mt-[10px] overflow-hidden rounded-[4px] border"
          diffFile={diffInstance}
          diffViewFontSize={13}
          diffViewHighlight={true}
          diffViewWrap
        />
      ) : (
        <div className="mt-[10px] rounded-[4px] border p-[10px] text-[22px] text-orange-500">Empty</div>
      )}
    </div>
  );
};

export const PlayGround = () => {
  const [type, setType] = useState<"git" | "file">("git");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("tab") === "git") {
      setType("git");
    } else if (query.get("tab") === "file") {
      setType("file");
    }
  }, []);

  return (
    <>
      {type === "git" ? (
        <_PlayGroundGitDiff
          onClick={() => {
            window.location.search = "tab=file";
            setType("file");
          }}
        />
      ) : (
        <_PlayGroundFileDiff
          onClick={() => {
            window.location.search = "tab=git";
            setType("git");
          }}
        />
      )}
    </>
  );
};
