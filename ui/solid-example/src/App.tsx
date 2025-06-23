import { DiffFile, DiffView } from "@git-diff-view/solid";
import { createEffect, createSignal, Show } from "solid-js";

import * as data from "./data";

import type { MessageData } from "./worker";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

type Key = "a" | "b" | "c" | "d" | "e";

function App() {
  const [key, setKey] = createSignal<Key>("a");

  const [diffFile, setDiffFile] = createSignal<DiffFile>();

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
      <div class="m-auto mb-[5em] w-[90%] overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]">
        <Show when={diffFile()}>
          <DiffView diffFile={diffFile()} diffViewWrap diffViewFontSize={14} diffViewHighlight={true} />
        </Show>
      </div>
    </>
  );
}

export default App;
