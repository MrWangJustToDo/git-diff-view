import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import { useMantineColorScheme } from "@mantine/core";
import { OverlayScrollbars } from "overlayscrollbars";
import { useEffect, useRef } from "react";

import type { DiffViewProps } from "@git-diff-view/react";

export const DiffViewWithScrollBar = (props: Omit<DiffViewProps<string[]>, "data">) => {
  const { diffViewMode = DiffModeEnum.Split, diffFile, diffViewWrap } = props;

  const { colorScheme } = useMantineColorScheme();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diffFile && !diffViewWrap) {
      const instanceArray: OverlayScrollbars[] = [];
      const init = () => {
        const isSplitMode = diffViewMode & DiffModeEnum.Split;
        if (isSplitMode) {
          const leftScrollbar = ref.current?.querySelector("[data-left]") as HTMLDivElement;
          const rightScrollbar = ref.current?.querySelector("[data-right]") as HTMLDivElement;
          const scrollContainers = Array.from(
            ref.current?.querySelectorAll(".diff-table-scroll-container") || []
          ) as HTMLDivElement[];
          const [left, right] = scrollContainers;
          if (left && right) {
            const i1 = OverlayScrollbars(
              { target: left, scrollbars: { slot: leftScrollbar } },
              {
                scrollbars: {
                  theme: colorScheme === "dark" ? "os-theme-light" : "os-theme-dark",
                },
                overflow: {
                  y: "hidden",
                },
              }
            );
            const i2 = OverlayScrollbars(
              { target: right, scrollbars: { slot: rightScrollbar } },
              {
                scrollbars: {
                  theme: colorScheme === "dark" ? "os-theme-light" : "os-theme-dark",
                },
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
          const scrollBarContainer = ref.current?.querySelector("[data-full]") as HTMLDivElement;
          const scrollContainer = ref.current?.querySelector(".diff-table-scroll-container") as HTMLDivElement;
          if (scrollContainer) {
            const i = OverlayScrollbars(
              { target: scrollContainer, scrollbars: { slot: scrollBarContainer } },
              {
                scrollbars: {
                  theme: colorScheme === "dark" ? "os-theme-light" : "os-theme-dark",
                },
                overflow: {
                  y: "hidden",
                },
              }
            );
            instanceArray.push(i);
          }
        }
      };
      // 当前 @my-react 的调度还很简陋，所以这里使用 setTimeout
      const id = setTimeout(init, 1000);
      return () => {
        clearTimeout(id);
        instanceArray.forEach((i) => i.destroy());
      };
    }
  }, [diffFile, diffViewWrap, diffViewMode, colorScheme]);

  return (
    <div ref={ref}>
      <DiffView {...props} />
      <div data-scroll-target className="sticky bottom-0 mt-[-6px] flex h-[6px] w-full">
        {diffViewMode & DiffModeEnum.Split ? (
          <>
            <div data-left className="relative w-[50%]"></div>
            <div data-right className="relative w-[50%]"></div>
          </>
        ) : (
          <div data-full></div>
        )}
      </div>
    </div>
  );
};
