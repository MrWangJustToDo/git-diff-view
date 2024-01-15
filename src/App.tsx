import { useState } from "react";
import { DiffView } from "./components/DiffView";
import * as data from "./data";
import { useDiffConfig } from "./hooks/useDiffConfig";
import { DiffModeEnum } from "./components/DiffViewContext";

type K = "a" | "b" | "c" | "d" | "e";

function App() {
  const [v, setV] = useState<K>("b");

  const { mode, setMode, setHighlight, setWrap, wrap, highlight } =
    useDiffConfig((s) => ({ ...s }));

  return (
    <>
      <div className="w-[90%] m-auto mb-[1em] mt-[1em]">
        <h2 className=" text-[24px]">
          A React component to show the file diff (just like github){" "}
          <span className="text-red-500"> (🚧 wip) </span>
        </h2>
        <br />
        <p>
          Select a file to show the diff: &nbsp;
          <select
            className="border rounded-sm"
            value={v}
            onChange={(e) => setV(e.target.value as K)}
          >
            <option value="a">diff 1</option>
            <option value="b">diff 2</option>
            <option value="c">diff 3</option>
            <option value="d">diff 4</option>
            <option value="e">diff 5</option>
          </select>
        </p>
      </div>
      <div className="w-[90%] m-auto mb-[1em] text-right">
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
            {highlight
              ? "Toggle to disable highlight"
              : "Toggle to enable highlight"}
          </button>
          <button
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
            onClick={() =>
              setMode(
                mode === DiffModeEnum.Split
                  ? DiffModeEnum.Unified
                  : DiffModeEnum.Split
              )
            }
          >
            {mode === DiffModeEnum.Split
              ? "Toggle to UnifiedMode"
              : "Toggle to SplitMode"}
          </button>
        </div>
      </div>

      <div className="w-[90%] m-auto border border-[grey] border-solid rounded-[5px] overflow-hidden mb-[5em]">
        <DiffView data={data[v]} />
      </div>
    </>
  );
}

export default App;
