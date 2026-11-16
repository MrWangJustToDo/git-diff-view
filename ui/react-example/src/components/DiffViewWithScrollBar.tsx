import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useRef } from "react";

import type { DiffViewProps } from "@git-diff-view/react";

/**
 * Split view whose two columns scroll horizontally in lockstep.
 *
 * The scroll containers are re-created by the diff view whenever the mode / wrap / diffFile
 * changes, so instead of caching them we look them up on every scroll. Doing this with plain
 * `scroll` events (rather than OverlayScrollbars) also keeps the example free of that library's
 * global scrollbar-slot state, which used to blank out unrelated diff views on the same page.
 */
export const DiffViewWithScrollBar = (props: Omit<DiffViewProps<string[]>, "data">) => {
  const { diffViewMode = DiffModeEnum.Split, diffViewWrap } = props;

  const { colorScheme } = useMantineColorScheme();

  const ref = useRef<HTMLDivElement>(null);

  const isSplit = !!(diffViewMode & DiffModeEnum.Split) && !diffViewWrap;

  useEffect(() => {
    const root = ref.current;

    if (!root || !isSplit) return;

    let syncing = false;

    const onScroll = (e: Event) => {
      const source = e.target as HTMLDivElement | null;

      if (syncing || !source) return;

      const isOld = source.classList.contains("old-diff-table-wrapper");
      const isNew = source.classList.contains("new-diff-table-wrapper");

      if (!isOld && !isNew) return;

      const target = root.querySelector(isOld ? ".new-diff-table-wrapper" : ".old-diff-table-wrapper");

      if (!(target instanceof HTMLElement)) return;

      syncing = true;
      target.scrollLeft = source.scrollLeft;
      syncing = false;
    };

    root.addEventListener("scroll", onScroll, true);

    return () => root.removeEventListener("scroll", onScroll, true);
  }, [isSplit]);

  return (
    <div ref={ref}>
      <DiffView {...props} diffViewTheme={colorScheme === "dark" ? "dark" : "light"} />
    </div>
  );
};
