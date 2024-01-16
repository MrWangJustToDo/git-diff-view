import { DiffFile } from "../diff";
import { addWidgetBGName, addWidgetColorName } from "./color";

// TODO
export const DiffAddWidget = ({ diffFile }: { diffFile: DiffFile }) => {
  return (
    <div
      className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
      style={{
        width: "calc(var(--diff-font-size--) * 1.4)",
        height: "calc(var(--diff-font-size--) * 1.4)",
      }}
    >
      <button
        className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-[0] top-[0] flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
        style={{
          color: `var(${addWidgetColorName})`,
          zIndex: 1,
          fontSize: `1.2em`,
          backgroundColor: `var(${addWidgetBGName})`,
        }}
      >
        +
      </button>
    </div>
  );
};
