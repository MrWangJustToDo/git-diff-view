import { DiffModeEnum, DiffView, DiffFile } from "@git-diff-view/react";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

const temp =
  'diff --git a/packages/myreact-reactivity/src/reactive/feature.ts b/packages/myreact-reactivity/src/reactive/feature.ts\nindex 5b301628..15aac42f 100644\n--- a/packages/myreact-reactivity/src/reactive/feature.ts\n+++ b/packages/myreact-reactivity/src/reactive/feature.ts\n@@ -74,7 +74,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n \n     componentWillUnmount(): void {\n       this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n     shouldComponentUpdate(): boolean {\n@@ -84,7 +84,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n       return true;\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -92,7 +92,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.effect.run() });\n+      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n     }\n   }\n \n@@ -104,10 +104,10 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     } & P\n   > {\n     componentWillUnmount(): void {\n-      this.effect.stop();\n+      this.reactiveEffect.stop();\n     }\n \n-    effect = new ReactiveEffect(() => {\n+    reactiveEffect = new ReactiveEffect(() => {\n       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n@@ -115,7 +115,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco\n     }, this.props.$$__trigger__$$);\n \n     render() {\n-      return this.effect.run();\n+      return this.reactiveEffect.run();\n     }\n   }\n';

const rawTemp =
  'import { Component, createElement, useState, useCallback, useMemo } from "@my-react/react";\n\nimport { proxyRefs, ReactiveEffect } from "../api";\n\nimport type { UnwrapRef } from "../api";\nimport type { LikeReactNode } from "@my-react/react";\n\ntype LifeCycle = {\n  onBeforeMount: Array<() => void>;\n\n  onMounted: Array<() => void>;\n\n  onBeforeUpdate: Array<() => void>;\n\n  onUpdated: Array<() => void>;\n\n  onBeforeUnmount: Array<() => void>;\n\n  onUnmounted: Array<() => void>;\n\n  hasHookInstalled: boolean;\n\n  canUpdateComponent: boolean;\n};\n\n/**\n * @internal\n */\nexport let globalInstance: LifeCycle | null = null;\n\nexport function createReactive<P extends Record<string, unknown>, S extends Record<string, unknown>>(props?: {\n  setup: () => S;\n  render?: (props: UnwrapRef<S> & P) => LikeReactNode;\n}) {\n  const setup = typeof props === "function" ? props : props.setup;\n\n  const render = typeof props === "function" ? null : props.render;\n\n  class ForBeforeUnmount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onBeforeUnmount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class ForBeforeMount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: LikeReactNode }> {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onBeforeMount.forEach((f) => f());\n    }\n\n    render() {\n      return this.props.children;\n    }\n  }\n\n  class RenderWithLifeCycle extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__instance__$$"]: LifeCycle;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentDidMount(): void {\n      this.props.$$__instance__$$.onMounted.forEach((f) => f());\n    }\n\n    componentDidUpdate(): void {\n      this.props.$$__instance__$$.onUpdated.forEach((f) => f());\n    }\n\n    componentWillUnmount(): void {\n      this.props.$$__instance__$$.onUnmounted.forEach((f) => f());\n      this.reactiveEffect.stop();\n    }\n\n    shouldComponentUpdate(): boolean {\n      this.props.$$__instance__$$.canUpdateComponent = false;\n      this.props.$$__instance__$$.onBeforeUpdate.forEach((f) => f());\n      this.props.$$__instance__$$.canUpdateComponent = true;\n      return true;\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });\n    }\n  }\n\n  class Render extends Component<\n    {\n      ["$$__trigger__$$"]: () => void;\n      ["$$__reactiveState__$$"]: UnwrapRef<S>;\n      children?: (props: UnwrapRef<S> & P) => LikeReactNode;\n    } & P\n  > {\n    componentWillUnmount(): void {\n      this.reactiveEffect.stop();\n    }\n\n    reactiveEffect = new ReactiveEffect(() => {\n      const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;\n      const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;\n      const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;\n      return element;\n    }, this.props.$$__trigger__$$);\n\n    render() {\n      return this.reactiveEffect.run();\n    }\n  }\n\n  const MyReactReactiveComponent = (props: P & { children?: (props: UnwrapRef<S> & P) => LikeReactNode }) => {\n    const [instance] = useState(() => ({\n      onBeforeMount: [],\n      onBeforeUpdate: [],\n      onBeforeUnmount: [],\n      onMounted: [],\n      onUpdated: [],\n      onUnmounted: [],\n      hasHookInstalled: false,\n      canUpdateComponent: true,\n    }));\n\n    const state = useMemo(() => {\n      globalInstance = instance;\n\n      const state = proxyRefs(setup());\n\n      globalInstance = null;\n\n      return state;\n    }, []);\n\n    if (__DEV__) {\n      for (const key in props) {\n        if (key in state) {\n          console.warn(`duplicate key ${key} in Component props and reactive state, please fix this usage`);\n        }\n      }\n      if (props["children"] && typeof props["children"] !== "function") {\n        throw new Error("the component which return from createReactive() expect a function children");\n      }\n    }\n\n    const [, setState] = useState(() => 0);\n\n    const updateCallback = useCallback(() => {\n      if (instance.canUpdateComponent) {\n        setState((i) => i + 1);\n      }\n    }, []);\n\n    if (instance.hasHookInstalled) {\n      return createElement(ForBeforeUnmount, {\n        ["$$__instance__$$"]: instance,\n        children: createElement(RenderWithLifeCycle, {\n          ...props,\n          ["$$__trigger__$$"]: updateCallback,\n          ["$$__reactiveState__$$"]: state,\n          ["$$__instance__$$"]: instance,\n        }),\n      }) as LikeReactNode;\n    } else {\n      return createElement(Render, { ...props, ["$$__trigger__$$"]: updateCallback, ["$$__reactiveState__$$"]: state }) as LikeReactNode;\n    }\n  };\n\n  return MyReactReactiveComponent;\n}\n';

export const PlayGround = () => {
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

  console.log(diffInstance);

  return (
    <div className="w-[90%] m-auto mt-[1em] mb-[1em]">
      <h2 className="text-[24px]">PlayGround -- input a `git --diff` string</h2>
      <div className="flex flex-col gap-y-[10px] mt-[10px]">
        <span className="border-b p-[3px]">Lang: </span>
        <input
          className="border-2 border-[#888] p-[4px] text-[14px] rounded-[4px]"
          type=""
          placeholder="input syntax lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        />
        <span className="border-b p-[3px]">`git --diff`: </span>
        <textarea
          cols={10}
          rows={5}
          autoFocus
          className="border-2 border-[#888] p-[4px] text-[14px] rounded-[4px]"
          placeholder="give a `git --diff` output"
          value={diffString}
          onChange={(e) => setDiffString(e.target.value)}
        ></textarea>
        <span className="border-b p-[3px]">Original file content (optional): </span>
        <textarea
          cols={10}
          rows={5}
          className="border-2 border-[#888] p-[4px] text-[14px] rounded-[4px]"
          placeholder="give a raw file content (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>

      {diffInstance ? (
        <DiffView<string>
          className="mt-[10px] border rounded-[4px] overflow-hidden"
          diffFile={diffInstance}
          diffViewFontSize={13}
          diffViewHighlight={true}
          diffViewMode={DiffModeEnum.Split}
          diffViewWrap
        />
      ) : (
        <div className="border mt-[10px] rounded-[4px] p-[10px] text-orange-500 text-[22px]">
          try to give a `git --diff` input, and see the result
        </div>
      )}
    </div>
  );
};
