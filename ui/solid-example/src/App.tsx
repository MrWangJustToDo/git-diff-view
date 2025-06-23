import { DiffFile, DiffModeEnum, DiffView, SplitSide } from "@git-diff-view/solid";
import { createEffect, createSignal, Show } from "solid-js";

import * as data from "./data";

import type { MessageData } from "./worker";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

type Key = "a" | "b" | "c" | "d" | "e";

function App() {
  const [key, setKey] = createSignal<Key>("a");

  const [diffFile, setDiffFile] = createSignal<DiffFile>();

  const [highlight, setHighlight] = createSignal(true);

  const [wrap, setWrap] = createSignal(true);

  const [dark, setDark] = createSignal(false);

  const [mode, setMode] = createSignal(DiffModeEnum.Split);

  const toggleHighlight = () => setHighlight((l) => !l);

  const toggleTheme = () => setDark((d) => !d);

  const toggleWrap = () => setWrap((w) => !w);

  const toggleMode = () =>
    setMode((l) => {
      return l === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split;
    });

  const [v, setV] = createSignal("");

  const [extend, setExtend] = createSignal({});

  worker.addEventListener("message", (e: MessageEvent<MessageData>) => {
    const { data, bundle } = e.data;
    const instance = DiffFile.createInstance(data || {}, bundle);
    setDiffFile(instance);
  });

  createEffect(() => {
    const currentKey = key();
    worker.postMessage({
      key: currentKey,
      // eslint-disable-next-line import/namespace
      data: data[currentKey],
    });
  });

  createEffect(() => {
    const currentDiffFile = diffFile();

    if (currentDiffFile) {
      setExtend({ oldFile: {}, newFile: {} });
    }
  });

  return (
    <>
      <div class="m-auto mb-[1em] mt-[1em] w-[90%]">
        <h2 class="text-[24px]">A Solid component to show the file diff</h2>
        <br />
        <p>
          Select a file to show the diff: &nbsp;
          <select class="rounded-sm border" value={key()} onChange={(e) => setKey(e.currentTarget.value as Key)}>
            <option value="a">diff 1</option>
            <option value="b">diff 2</option>
            <option value="c">diff 3</option>
            <option value="d">diff 4</option>
            <option value="e">diff 5</option>
          </select>
        </p>
      </div>
      <div class="m-auto mb-[1em] w-[90%] text-right">
        <div class="inline-flex gap-x-4">
          <button
            class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
            onClick={toggleWrap}
          >
            {wrap() ? "Toggle to nowrap" : "Toggle to wrap"}
          </button>
          <button
            class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
            onClick={toggleHighlight}
          >
            {highlight() ? "Toggle to disable highlight" : "Toggle to enable highlight"}
          </button>
          <button
            class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
            onClick={toggleTheme}
          >
            {dark() ? "Toggle to light theme" : "Toggle to dark theme"}
          </button>
          <button
            class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
            onClick={toggleMode}
          >
            {mode() === DiffModeEnum.Split ? "Toggle to UnifiedMode" : "Toggle to SplitMode"}
          </button>
        </div>
      </div>
      <div class="m-auto mb-[5em] w-[90%] overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]">
        <Show when={diffFile()}>
          <DiffView
            diffFile={diffFile()}
            diffViewWrap={wrap()}
            diffViewMode={mode()}
            diffViewFontSize={14}
            diffViewHighlight={highlight()}
            diffViewTheme={dark() ? "dark" : "light"}
            extendData={extend()}
            diffViewAddWidget
            onAddWidgetClick={() => setV("")}
            renderWidgetLine={({ side, lineNumber, onClose }) => (
              <div class="flex w-full flex-col border px-[4px] py-[8px]">
                <textarea class="min-h-[80px] w-full border p-[2px]" value={v()} onChange={e => setV(e.target.value)} />
                <div class="m-[5px] mt-[0.8em] text-right">
                  <div class="inline-flex justify-end gap-x-[12px]">
                    <button class="rounded-[4px] border px-[12px] py-[6px]" onClick={onClose}>
                      cancel
                    </button>
                    <button
                      class="rounded-[4px] border px-[12px] py-[6px]"
                      onClick={() => {
                        if (v().length) {
                          const _side = side === SplitSide.old ? "oldFile" : "newFile";
                          setExtend((last) => ({
                            ...last,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            [_side]: { ...last[_side], [lineNumber]: { data: v() } },
                          }));
                          onClose();
                        }
                      }}
                    >
                      submit
                    </button>
                  </div>
                </div>
              </div>
            )}
            renderExtendLine={({ data }) => (
              <div class="flex border bg-slate-400 px-[10px] py-[8px]">
                <h2 class="text-[20px]">
                  {" "}
                  {">>"} {data as string}{" "}
                </h2>
              </div>
            )}
          />
        </Show>
      </div>
    </>
  );
}

export default App;
