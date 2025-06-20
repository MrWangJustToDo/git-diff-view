import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { useRenderWidget } from "../hooks";

import { useDiffWidgetContext } from "./DiffWidgetContext";

export const DiffSplitWidgetLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const renderWidget = useRenderWidget();

  const [widget, setWidget] = useDiffWidgetContext() || [];

  const [oldLine, setOldLine] = createSignal(props.diffFile.getSplitLeftLine(props.index));

  const [newLine, setNewLine] = createSignal(props.diffFile.getSplitRightLine(props.index));

  const oldLineWidget = createMemo(
    () => oldLine().lineNumber && widget?.()?.side === SplitSide.old && widget?.()?.lineNumber === oldLine().lineNumber
  );

  const newLineWidget = createMemo(
    () => newLine().lineNumber && widget?.()?.side === SplitSide.new && widget?.()?.lineNumber === newLine().lineNumber
  );

  createEffect(() => {
    const init = () => {
      setOldLine(props.diffFile.getSplitLeftLine(props.index));
      setNewLine(props.diffFile.getSplitRightLine(props.index));
    };

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const onCloseWidget = () => setWidget?.({});
};
