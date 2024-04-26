/* eslint-disable max-lines */
import { DiffModeEnum, DiffView as DiffViewReact, SplitSide, DiffFile } from "@git-diff-view/react";
import { DiffView as DiffViewVue } from "@git-diff-view/vue";
import { OverlayScrollbars } from "overlayscrollbars";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, ref } from "vue";
import "overlayscrollbars/overlayscrollbars.css";

import * as data from "./data";
import { useDiffConfig } from "./hooks/useDiffConfig";
import { usePrevious } from "./hooks/usePrevious";

import type { MessageData } from "./worker";
import type { DiffViewProps } from "@git-diff-view/react";
import type { Root } from "react-dom/client";
import type { App } from "vue";

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

type K = "a" | "b" | "c" | "d" | "e" | "j";

const TextArea = ({ onChange }: { onChange: (v: string) => void }) => {
  const [val, setVal] = useState("");

  useEffect(() => {
    onChange(val);
  }, [val]);

  return (
    <textarea
      className="w-full border min-h-[80px] !p-[2px]"
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
    />
  );
};

const vRef = ref("");

export function Example() {
  const [v, setV] = useState<K>("b");

  const reactWrapRef = useRef<HTMLDivElement>(null);

  const vueWrapRef = useRef<HTMLDivElement>(null);

  const reactRef = useRef<HTMLDivElement | null>();

  const vueRef = useRef<HTMLDivElement | null>();

  const reactApp = useRef<Root>();

  const [expandAll, setExpandAll] = useState(false);

  const [scrollBar, setScrollBar] = useState(true);

  const ref = useRef<{ getDiffFileInstance: () => DiffFile }>(null);

  const vueApp = useRef<App>();

  const [diffFileInstance, setDiffFileInstance] = useState<DiffFile>();

  const { mode, setMode, highlight, setHighlight, wrap, setWrap, fontsize } = useDiffConfig();

  const highlightRef = useRef(highlight);

  highlightRef.current = highlight;

  const previous = usePrevious(diffFileInstance);

  const [extend, setExtend] = useState<DiffViewProps<string>["extendData"]>({
    oldFile: { "80": { data: "hello world!" } },
    newFile: { "87": { data: "line have been changed!" } },
  });

  const valRef = useRef("");

  useEffect(() => {
    if (previous && diffFileInstance !== previous) {
      setExtend({ oldFile: {}, newFile: {} });
    }
  }, [diffFileInstance, previous]);

  useEffect(() => {
    worker.addEventListener("message", (e: MessageEvent<MessageData>) => {
      const { data, bundle } = e.data;
      const instance = DiffFile.createInstance(data || {}, bundle);
      setExpandAll(false);
      setDiffFileInstance(instance);
      console.timeEnd("parse");
    });
  }, []);

  useEffect(() => {
    const _data = data[v];
    if (_data) {
      console.time("parse");
      worker.postMessage({ type: "parse", data: _data, highlight: highlightRef.current });
    }
  }, [v]);

  useEffect(() => {
    if (expandAll) {
      ref.current
        ?.getDiffFileInstance?.()
        .onAllExpand(useDiffConfig.getReadonlyState().mode & DiffModeEnum.Split ? "split" : "unified");
    } else {
      ref.current
        ?.getDiffFileInstance?.()
        .onAllCollapse(useDiffConfig.getReadonlyState().mode & DiffModeEnum.Split ? "split" : "unified");
    }
  }, [expandAll]);

  const reactElement = (
    <DiffViewReact<string>
      ref={ref}
      renderWidgetLine={({ onClose, side, lineNumber }) => (
        <div className="border flex flex-col w-full px-[4px] py-[8px]">
          <TextArea onChange={(v) => (valRef.current = v)} />
          <div className="m-[5px] mt-[0.8em] text-right">
            <div className="inline-flex gap-x-[12px] justify-end">
              <button
                className="border !px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  valRef.current = "";
                }}
              >
                cancel
              </button>
              <button
                className="border !px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  if (valRef.current) {
                    const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                    setExtend((prev) => {
                      const res = { ...prev };
                      res[sideKey] = { ...res[sideKey], [lineNumber]: { lineNumber, data: valRef.current } };
                      return res;
                    });
                    setTimeout(() => {
                      valRef.current = "";
                    });
                  }
                }}
              >
                submit
              </button>
            </div>
          </div>
        </div>
      )}
      // use data
      // data={data[v]}
      diffFile={diffFileInstance}
      extendData={extend}
      renderExtendLine={({ data }) => {
        return (
          <div className="px-[8px] py-[6px] bg-slate-200">
            <div className="border border-solid border-[rgb(200,200,200)] rounded-[4px]">
              <div className="my-[5px] mx-[4px]">
                <div className="w-[24px] h-[24px] inline-flex items-center justify-center rounded-full bg-slate-300">
                  @
                </div>
                <span className="text-[11px] mx-[4px] text-[grey]">:</span>
                <span className="text-[11px] text-[grey]">{new Date().toLocaleString()}</span>
              </div>
              <div className="bg-[rgb(210,210,210)] h-[1px] my-[5px]"></div>
              <div className="indent-1 my-[5px] mx-[4px]">
                <span className="text-[15px]">{data}</span>
              </div>
            </div>
          </div>
        );
      }}
      diffViewFontSize={fontsize}
      diffViewHighlight={highlight}
      diffViewMode={mode}
      diffViewWrap={wrap}
      diffViewAddWidget
      onAddWidgetClick={console.log}
    />
  );

  const vueElement = h(
    DiffViewVue,
    {
      // use worker
      diffFile: diffFileInstance,
      extendData: extend,
      diffViewFontSize: fontsize,
      diffViewHighlight: highlight,
      diffViewMode: mode,
      diffViewWrap: wrap,
      diffViewAddWidget: true,
    },
    {
      widget: ({ onClose, side, lineNumber }: { onClose: () => void; side: SplitSide; lineNumber: number }) =>
        h("div", { class: "border flex flex-col w-full px-[4px] py-[8px]" }, [
          h("textarea", {
            class: "w-full border min-h-[80px] !p-[2px]",
            value: vRef.value,
            onChange: (e: InputEvent) => (vRef.value = (e.target as HTMLTextAreaElement).value),
          }),
          h("div", { class: "m-[5px] mt-[0.8em] text-right" }, [
            h("div", { class: "inline-flex gap-x-[12px] justify-end" }, [
              h(
                "button",
                {
                  class: "border !px-[12px] py-[6px] rounded-[4px]",
                  onClick: () => {
                    onClose();
                    vRef.value = "";
                  },
                },
                "cancel"
              ),
              h(
                "button",
                {
                  class: "border !px-[12px] py-[6px] rounded-[4px]",
                  onClick: () => {
                    onClose();
                    if (vRef.value) {
                      const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                      setExtend((prev) => {
                        const res = { ...prev };
                        res[sideKey] = { ...res[sideKey], [lineNumber]: { lineNumber, data: vRef.value } };
                        return res;
                      });
                      setTimeout(() => {
                        vRef.value = "";
                      });
                    }
                  },
                },
                "submit"
              ),
            ]),
          ]),
        ]),
      extend: ({ data }: { data: string }) => {
        return h("div", { class: "px-[8px] py-[6px] bg-slate-200" }, [
          h("div", { class: "border border-solid border-[rgb(200,200,200)] rounded-[4px]" }, [
            h("div", { class: "my-[5px] mx-[4px]" }, [
              h(
                "div",
                { class: "w-[24px] h-[24px] inline-flex items-center justify-center rounded-full bg-slate-300" },
                "@"
              ),
              h("span", { class: "text-[11px] mx-[4px] text-[grey]" }, ":"),
              h("span", { class: "text-[11px] text-[grey]" }, new Date().toLocaleString()),
            ]),
            h("div", { class: "bg-[rgb(210,210,210)] h-[1px] my-[5px]" }),
            h("div", { class: "indent-1 my-[5px] mx-[4px]" }, [h("span", { class: "text-[15px]" }, data)]),
          ]),
        ]);
      },
    }
  );

  useEffect(() => {
    reactRef.current = document.getElementById("react")! as HTMLDivElement;
    vueRef.current = document.getElementById("vue")! as HTMLDivElement;
  }, []);

  useEffect(() => {
    reactApp.current = reactApp.current || createRoot(reactRef.current!);
  }, []);

  useEffect(() => {
    if (diffFileInstance) {
      // mount react
      reactApp.current?.render?.(reactElement);
      // mount vue
      vueApp.current = createApp(vueElement);
      vueApp.current.mount(vueRef.current!);

      return () => vueApp.current?.unmount?.();
    }
  }, [diffFileInstance, reactElement]);

  const eleString1 = useMemo(() => ({ __html: `<div id='react'></div>` }), []);
  const eleString2 = useMemo(() => ({ __html: `<div id='vue'></div>` }), []);

  // same logic for vue app;
  useEffect(() => {
    if (diffFileInstance && scrollBar && !wrap) {
      const instanceArray: OverlayScrollbars[] = [];
      const init = () => {
        const isSplitMode = mode & DiffModeEnum.Split;
        if (isSplitMode) {
          const leftScrollbar = reactWrapRef.current?.querySelector("[data-left]") as HTMLDivElement;
          const rightScrollbar = reactWrapRef.current?.querySelector("[data-right]") as HTMLDivElement;
          const scrollContainers = Array.from(
            reactRef.current?.querySelectorAll(".scrollbar-hide") || []
          ) as HTMLDivElement[];
          const [left, right] = scrollContainers;
          if (left && right) {
            const i1 = OverlayScrollbars(
              { target: left, scrollbars: { slot: leftScrollbar } },
              {
                overflow: {
                  y: "hidden",
                },
              }
            );
            const i2 = OverlayScrollbars(
              { target: right, scrollbars: { slot: rightScrollbar } },
              {
                overflow: {
                  y: "hidden",
                },
              }
            );
            instanceArray.push(i1, i2);
            const leftScrollEle = i1.elements().scrollEventElement as HTMLDivElement;
            const rightScrollEle = i2.elements().scrollEventElement as HTMLDivElement;
            i1.on("scroll", () => {
              rightScrollEle.scrollLeft = leftScrollEle.scrollLeft;
            });
            i2.on("scroll", () => {
              leftScrollEle.scrollLeft = rightScrollEle.scrollLeft;
            });
          }
        } else {
          const scrollBarContainer = reactWrapRef.current?.querySelector("[data-full]") as HTMLDivElement;
          const scrollContainer = reactRef.current?.querySelector(".scrollbar-hide") as HTMLDivElement;
          if (scrollContainer) {
            const i = OverlayScrollbars(
              { target: scrollContainer, scrollbars: { slot: scrollBarContainer } },
              {
                overflow: {
                  y: "hidden",
                },
              }
            );
            instanceArray.push(i);
          }
        }
      };
      // 当前 @myreact 的调度还很简陋，所以这里使用 setTimeout
      const id = setTimeout(init, 1000);
      return () => {
        clearTimeout(id);
        instanceArray.forEach((i) => i.destroy());
      };
    }
  }, [diffFileInstance, scrollBar, wrap, mode]);

  return (
    <>
      <div className="w-[90%] m-auto mb-[1em] mt-[1em]">
        <h2 className=" text-[24px]">
          A <code className=" bg-slate-100 px-[4px] rounded-sm">React</code> /{" "}
          <code className="bg-slate-100 px-[4px] rounded-sm">Vue</code> component to show the file diff (like Github)
        </h2>
        <br />
        <p>
          Select a file to show the diff: &nbsp;
          <select className="border rounded-sm" value={v} onChange={(e) => setV(e.target.value as K)}>
            <option value="a">diff 1</option>
            <option value="b">diff 2</option>
            <option value="c">diff 3</option>
            <option value="d">diff 4</option>
            <option value="e">diff 5</option>
            <option value="j">large file 1</option>
            <option value="k">large file 2</option>
          </select>
        </p>
      </div>
      <div className="w-[90%] m-auto mb-[1em] text-right text-[12px]">
        <div className="inline-flex gap-x-4">
          {!wrap && (
            <button
              className="bg-sky-400 hover:bg-sky-500 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
              onClick={() => setScrollBar(!scrollBar)}
            >
              {scrollBar ? "toggle to disable scrollbar" : "toggle to enable scrollbar"}
            </button>
          )}
          <button
            className="bg-sky-400 hover:bg-sky-500 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? "toggle to collapseAll" : "toggle to expandAll"}
          </button>
          <button
            className="bg-sky-400 hover:bg-sky-500 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setWrap(!wrap)}
          >
            {wrap ? "Toggle to nowrap" : "Toggle to wrap"}
          </button>
          <button
            className="bg-sky-400 hover:bg-sky-500 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setHighlight(!highlight)}
          >
            {highlight ? "Toggle to disable highlight" : "Toggle to enable highlight"}
          </button>
          <button
            className="bg-sky-400 hover:bg-sky-500 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() => setMode(mode & DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.SplitGitHub)}
          >
            {mode & DiffModeEnum.Split ? "Toggle to UnifiedMode" : "Toggle to SplitMode"}
          </button>
        </div>
      </div>

      <div className="flex w-[95%] m-auto mb-2">
        <div className="w-full flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            // xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="35.93"
            height="32"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 256 228"
          >
            <path
              fill="#00D8FF"
              d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"
            ></path>
          </svg>
          <div className="ml-[6px]"></div>
          React Example:{" "}
        </div>
        <div className="w-full flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            // xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="37.07"
            height="36"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 256 198"
          >
            <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z"></path>
            <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z"></path>
            <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z"></path>
          </svg>
          <div className="ml-[6px]"></div>
          Vue Example:{" "}
        </div>
      </div>

      <div className="flex items-start w-[95vw] gap-x-1 m-auto">
        <div ref={reactWrapRef} className=" flex-grow-0 w-[50%]">
          <div
            className="w-full border border-[#c8c8c8] border-solid rounded-[5px] overflow-hidden"
            dangerouslySetInnerHTML={eleString1}
          />
          <div data-scroll-target className="sticky bottom-0 w-full h-[6px] flex mt-[-6px]">
            {mode & DiffModeEnum.Split ? (
              <>
                <div data-left className="w-[50%] relative"></div>
                <div data-right className="w-[50%] relative"></div>
              </>
            ) : (
              <div data-full></div>
            )}
          </div>
        </div>
        <div ref={vueWrapRef} className=" flex-grow-0 w-[50%]">
          <div
            className="w-full border border-[#c8c8c8] border-solid rounded-[5px] overflow-hidden"
            dangerouslySetInnerHTML={eleString2}
          />
          <div data-scroll-target className="sticky bottom-0"></div>
        </div>
      </div>
      <div className="mb-[5em]" />
    </>
  );
}
