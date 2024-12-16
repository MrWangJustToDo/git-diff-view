import { getTextMeasureInstance } from "@git-diff-view/utils";
import { ref, watchPostEffect } from "vue";

import { useIsMounted } from "./useIsMounted";

import type { Ref } from "vue";

export const useTextWidth = ({
  text,
  font,
}: {
  text: Ref<string>;
  font: Ref<{ fontFamily?: string; fontStyle?: string; fontSize?: string }>;
}) => {
  const isMounted = useIsMounted();

  const fontSize = parseInt(font.value.fontSize);

  let baseSize = 6;

  baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;

  const width = ref(baseSize * text.value.length);

  const measureText = () => {
    if (!isMounted.value) return;
    width.value = getTextMeasureInstance().measure(text.value || "", font.value);
  };

  watchPostEffect(measureText);

  return width;
};
