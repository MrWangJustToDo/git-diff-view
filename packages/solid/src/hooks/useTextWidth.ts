import { getTextMeasureInstance } from "@git-diff-view/utils";
import { createEffect, createSignal, type Accessor } from "solid-js";

import { useIsMounted } from "./useIsMounted";

export const useTextWidth = ({
  text,
  font,
}: {
  text: Accessor<string>;
  font?: Accessor<{ fontSize: string; fontFamily: string }>;
}) => {
  const isMounted = useIsMounted();

  let baseSize = 6;

  const fontSize = parseInt(font?.()?.fontSize || "14");

  baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;

  const [width, setWidth] = createSignal(baseSize * text().length);

  const measureText = () => {
    const isMountedValue = isMounted();
    if (!isMountedValue) return;
    setWidth(getTextMeasureInstance().measure(text(), font?.() || {}));
  };

  createEffect(measureText);

  return width;
};
