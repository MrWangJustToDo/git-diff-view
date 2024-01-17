import { DiffFileExtends } from "../diff";
import { SplitSide } from "./DiffSplitView";
import { addWidgetBGName, addWidgetColorName } from "./color";

export const DiffSplitAddWidget = ({
  diffFile,
  side,
  index,
}: {
  index: number;
  diffFile: DiffFileExtends;
  side: SplitSide;
}) => {
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
        onClick={() => {
          diffFile.addSplitExtendLine(
            index,
            side === SplitSide.old ? "left" : "right",
            <div className="border flex flex-col w-full">
              <textarea className="w-full border min-h-[80px] p-[2px]" />
              <div className="m-[5px] mt-[0.8em]">
                <button
                  className="border float-right px-[12px] py-[6px] rounded-[4px] sticky right-[10px]"
                  onClick={() =>
                    diffFile.removeSplitExtendLine(
                      index,
                      side === SplitSide.old ? "left" : "right"
                    )
                  }
                >
                  cancel
                </button>
              </div>
            </div>
          );
        }}
      >
        +
      </button>
    </div>
  );
};

export const DiffUnifiedAddWidget = ({
  diffFile,
  index,
}: {
  index: number;
  diffFile: DiffFileExtends;
}) => {
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
        onClick={() => {
          diffFile.addUnifiedLine(
            index,
            <div className="border flex flex-col w-full px-[4px] py-[8px]">
              <textarea className="w-full border min-h-[80px] p-[2px]" />
              <div className="m-[5px] mt-[0.8em]">
                <button
                  className="border float-right px-[12px] py-[6px] rounded-[4px] sticky right-[10px]"
                  onClick={() => diffFile.removeUnifiedExtendLine(index)}
                >
                  cancel
                </button>
              </div>
            </div>
          );
        }}
      >
        +
      </button>
    </div>
  );
};
