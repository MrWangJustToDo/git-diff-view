import { DiffFile } from "@git-diff-view/core";
import { DiffModeEnum, DiffView as DiffViewReact, SplitSide } from "@git-diff-view/react";
import { DiffView as DiffViewVue } from "@git-diff-view/vue";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h } from "vue";

import * as data from "./data";
import { useDiffConfig } from "./hooks/useDiffConfig";
import { usePrevious } from "./hooks/usePrevious";

import type { MessageData } from "./worker";
import type { DiffViewProps } from "@git-diff-view/react";

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

type K = "a" | "b" | "c" | "d" | "e" | "j";

export function Example() {
  const [v, setV] = useState<K>("b");

  const reactRoot = useRef<HTMLDivElement>(null);

  const vueRef = useRef<HTMLDivElement>(null);

  const reactApp = useRef();

  const vueApp = useRef();

  const [diffFileInstance, setDiffFileInstance] = useState<DiffFile>();

  const previous = usePrevious(diffFileInstance);

  const [extend, setExtend] = useState<DiffViewProps<string>["extendData"]>({
    oldFile: { "80": { data: "hello world!" } },
    newFile: { "87": { data: "line have been changed!" } },
  });

  const [val, setVal] = useState("");

  useEffect(() => {
    if (previous && diffFileInstance !== previous) {
      setExtend({ oldFile: {}, newFile: {} });
    }
  }, [diffFileInstance, previous]);

  useEffect(() => {
    worker.addEventListener("message", (e: MessageEvent<MessageData>) => {
      const { data, bundle } = e.data;
      const instance = DiffFile.createInstance(data || {}, bundle);
      setDiffFileInstance(instance);
      console.timeEnd("parse");
    });
  }, []);

  useEffect(() => {
    reactApp.current = reactApp.current || createRoot(reactRoot.current!);
  }, []);

  useEffect(() => {
    const _data = data[v];
    if (_data) {
      console.time("parse");
      worker.postMessage({ type: "parse", data: _data });
    }
  }, [v]);

  const { mode, setMode, highlight, setHighlight, wrap, setWrap, fontsize } = useDiffConfig((s) => ({ ...s }));

  const reactElement = (
    <DiffViewReact<string>
      renderWidgetLine={({ onClose, side, lineNumber }) => (
        <div className="border flex flex-col w-full px-[4px] py-[8px]">
          <textarea
            className="w-full border min-h-[80px] p-[2px]"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <div className="m-[5px] mt-[0.8em] text-right">
            <div className="inline-flex gap-x-[12px] justify-end">
              <button
                className="border px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  setVal("");
                }}
              >
                cancel
              </button>
              <button
                className="border px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  if (val) {
                    const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                    setExtend((prev) => {
                      const res = { ...prev };
                      res[sideKey] = { ...res[sideKey], [lineNumber]: { lineNumber, data: val } };
                      return res;
                    });
                    setVal("");
                  }
                }}
              >
                submit
              </button>
            </div>
          </div>
        </div>
      )}
      // data={data[v]}
      diffFile={diffFileInstance}
      extendData={extend}
      renderExtendLine={({ data }) => {
        return (
          <div className="border flex px-[10px] py-[8px] bg-slate-400">
            <h2 className="text-[20px]">
              {">> "}
              {data}
            </h2>
          </div>
        );
      }}
      diffViewFontSize={fontsize}
      diffViewHighlight={highlight}
      diffViewMode={mode}
      diffViewWrap={wrap}
      diffViewAddWidget
    />
  );

  const vueElement = h(
    DiffViewVue,
    {
      diffFile: diffFileInstance,
      extendData: extend,
      diffViewFontSize: fontsize,
      diffViewHighlight: highlight,
      diffViewMode: mode,
      diffViewWrap: wrap,
      diffViewAddWidget: true,
    },
    {
      widget: ({ onClose, side, lineNumber }) =>
        h("div", { class: "border flex flex-col w-full px-[4px] py-[8px]" }, [
          h("textarea", {
            class: "w-full border min-h-[80px] p-[2px]",
            value: val,
            onInput: (e: InputEvent) => setVal((e.target as HTMLTextAreaElement).value),
          }),
          h("div", { class: "m-[5px] mt-[0.8em] text-right" }, [
            h("div", { class: "inline-flex gap-x-[12px] justify-end" }, [
              h(
                "button",
                {
                  class: "border px-[12px] py-[6px] rounded-[4px]",
                  onClick: () => {
                    onClose();
                    setVal("");
                  },
                },
                "cancel"
              ),
              h(
                "button",
                {
                  class: "border px-[12px] py-[6px] rounded-[4px]",
                  onClick: () => {
                    onClose();
                    if (val) {
                      const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                      setExtend((prev) => {
                        const res = { ...prev };
                        res[sideKey] = { ...res[sideKey], [lineNumber]: { lineNumber, data: val } };
                        return res;
                      });
                      setVal("");
                    }
                  },
                },
                "submit"
              ),
            ]),
          ]),
        ]),
      extend: ({ data }) =>
        h("div", { class: "border flex px-[10px] py-[8px] bg-slate-400" }, [
          h("h2", { class: "text-[20px]" }, [">> ", data]),
        ]),
    }
  );

  useEffect(() => {
    if (diffFileInstance) {
      // mount react
      delete reactRoot.current.__fiber__;
      reactApp.current?.render?.(reactElement);
      // mount vue
      vueApp.current?.unmount?.();
      vueApp.current = createApp(vueElement);
      vueApp.current.mount(vueRef.current!);
    }
  }, [diffFileInstance, reactElement]);

  return (
    <>
      <div className="w-[90%] m-auto mb-[1em] mt-[1em]">
        <h2 className=" text-[24px]">A <code className=" bg-slate-100 px-[4px] rounded-sm">React</code> / <code className="bg-slate-100 px-[4px] rounded-sm">Vue</code> component to show the file diff (like Github)</h2>
        <br />
        <p>
          Select a file to show the diff: &nbsp;
          <select className="border rounded-sm" value={v} onChange={(e) => setV(e.target.value as K)}>
            <option value="a">diff 1</option>
            <option value="b">diff 2</option>
            <option value="c">diff 3</option>
            <option value="d">diff 4</option>
            <option value="e">diff 5</option>
            <option value="j">large file</option>
            <option value="k">large file</option>
          </select>
        </p>
      </div>
      <div className="w-[90%] m-auto mb-[1em] text-right text-[12px]">
        <div className="inline-flex gap-x-4">
          <button
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setWrap(!wrap)}
          >
            {wrap ? "Toggle to nowrap" : "Toggle to wrap"}
          </button>
          <button
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setHighlight(!highlight)}
          >
            {highlight ? "Toggle to disable highlight" : "Toggle to enable highlight"}
          </button>
          <button
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setMode(mode === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split)}
          >
            {mode === DiffModeEnum.Split ? "Toggle to UnifiedMode" : "Toggle to SplitMode"}
          </button>
        </div>
      </div>

      <div className="flex w-[95%] m-auto mb-2">
        <div className="w-full">React Example: </div>
        <div className="w-full">Vue Example: </div>
      </div>

      <div className="flex items-start w-[95%] gap-x-1 m-auto">
        <div
          id="react"
          ref={reactRoot}
          className="w-full border border-[grey] border-solid rounded-[5px] overflow-hidden mb-[5em]"
        ></div>
        <div
          id="vue"
          ref={vueRef}
          className="w-full border border-[grey] border-solid rounded-[5px] overflow-hidden mb-[5em]"
        ></div>
      </div>
    </>
  );
}
