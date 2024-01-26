import { useState } from "react";

import { Example } from "./Example";
import { PlayGround } from "./PlayGround";

function App() {
  const [type, setType] = useState<"try" | "example">("example");

  return (
    <>
      <div className="w-[90%] m-auto mb-[1em] mt-[4em] text-right">
        <button
          className=" bg-slate-500 hover:bg-slate-800 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white text-[18px]"
          onClick={() => setType((last) => (last === "example" ? "try" : "example"))}
        >
          {type === "example" ? "Toggle to playground" : "Toggle to example"}
        </button>
      </div>

      {type === "example" ? <Example /> : <PlayGround />}
    </>
  );
}

export default App;
