import { getDiffViewHighlighter } from "@git-diff-view/shiki";
import { createElement } from "@my-react/react";
import { Box, render, Text } from "@my-react/react-terminal";
// import { Box, render, Text } from "ink";
// import { createElement } from "react";

import { DiffView, DiffModeEnum } from "@git-diff-view/cli";

const hunk = `diff --git a/packages/myreact-reactivity/src/reactive/feature.ts b/packages/myreact-reactivity/src/reactive/feature.ts
index 5b301628..15aac42f 100644
--- a/packages/myreact-reactivity/src/reactive/feature.ts
+++ b/packages/myreact-reactivity/src/reactive/feature.ts
@@ -74,7 +74,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco
 
     componentWillUnmount(): void {
       this.props.$$__instance__$$.onUnmounted.forEach((f) => f());
+      this.reactiveEffect.stop();
     }
 
     shouldComponentUpdate(): boolean {
@@ -84,7 +84,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco
       return true;
     }
 
-    effect = new ReactiveEffect(() => {
+    reactiveEffect = new ReactiveEffect(() => {
       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;
       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;
       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;
@@ -92,7 +92,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco
     }, this.props.$$__trigger__$$);
 
     render() {
-      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.effect.run() });
+      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.reactiveEffect.run() });
     }
   }
 
@@ -104,10 +104,10 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco
     } & P
   > {
     componentWillUnmount(): void {
-      this.effect.stop();
+      this.reactiveEffect.stop();
     }
 
-    effect = new ReactiveEffect(() => {
+    reactiveEffect = new ReactiveEffect(() => {
       const { children, $$__trigger__$$, $$__reactiveState__$$, $$__instance__$$, ...last } = this.props;
       const targetRender = (render || children) as (props: UnwrapRef<S> & P) => LikeReactNode;
       const element = targetRender?.({ ...last, ...$$__reactiveState__$$ } as UnwrapRef<S> & P) || null;
@@ -115,7 +115,7 @@ export function createReactive<P extends Record<string, unknown>, S extends Reco
     }, this.props.$$__trigger__$$);
 
     render() {
-      return this.effect.run();
+      return this.reactiveEffect.run();
     }
   }
`;

getDiffViewHighlighter().then((highlighter) => {
  render(
    //     createElement(
    //  Box,
    //  { flexShrink: 0, flexGrow: 1 },
    //  null,
    // createElement(DiffView, {
    //   data: { hunks: [hunks], newFile: { fileLang: "tsx" } },
    //   diffViewTheme: "light",
    //   diffViewHighlight: true,
    //   diffViewMode: DiffModeEnum.SplitGitLab,
    // }),
    //  createElement(Box, { flexGrow: 1, flexShrink: 0 }, createElement(Text, null, "Diff View: Split Mode")),
    //  createElement(DiffView, {
    //    data: { hunks: [hunks], newFile: { fileLang: "tsx" } },
    //    width: 60,
    //    diffViewTheme: "light",
    //    diffViewHighlight: true,
    //    registerHighlighter: highlighter,
    //    diffViewMode: DiffModeEnum.Split,
    //  }),
    createElement(DiffView, {
      data: { hunks: [hunk], newFile: { fileLang: "tsx" } },
      // width: 80,
      diffViewTheme: "light",
      // diffViewTabWidth: 'small',
      // diffViewTabSpace: true,
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
      diffViewMode: DiffModeEnum.SplitGitLab,
    })
    //     )
  );
});

// render(
//   createElement(DiffView, {
//     data: { hunks: [hunks], newFile: { fileLang: "tsx" } },
//     diffViewTheme: "light",
//     diffViewHighlight: true,
//     diffViewMode: DiffModeEnum.SplitGitLab,
//   })
// );
