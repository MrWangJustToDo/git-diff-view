import { ref, watchPostEffect } from "vue";

import { useIsMounted } from "./useIsMounted";

import type { Ref} from "vue";

let canvasCtx: CanvasRenderingContext2D | null = null;

export class TextMeasure {
  #key: string = "";

  #map: Record<string, number> = {};

  #getInstance(): CanvasRenderingContext2D {
    canvasCtx = canvasCtx || document.createElement("canvas").getContext("2d");
    return canvasCtx!;
  }

  measure(text: string, font?: { fontFamily?: string; fontStyle?: string; fontSize?: string }) {
    const currentKey = `${font?.fontFamily}-${font?.fontStyle}-${font?.fontSize}-${text}`;
    if (this.#map[currentKey]) {
      return this.#map[currentKey];
    }
    const instance = this.#getInstance();
    if (font) {
      const currentFontKey = `${font.fontFamily}-${font.fontStyle}-${font.fontSize}`;
      if (this.#key !== currentFontKey) {
        this.#key = currentFontKey;
        instance.font = `${font.fontStyle || ""} ${font.fontSize || ""} ${font.fontFamily || ""}`;
      }
    } else {
      instance.font = "";
    }
    const textWidth = instance.measureText(text).width;

    return textWidth;
  }
}

const measureInstance = new TextMeasure();

export const useTextWidth = ({
  text,
  font,
}: {
  text: Ref<string>;
  font: Ref<{ fontFamily?: string; fontStyle?: string; fontSize?: string }>;
}) => {
  const isMounted = useIsMounted();

  const width = ref(0);

  const measureText = () => {
    if (!isMounted.value) return;
    width.value = measureInstance.measure(text.value, font.value);
  };

  watchPostEffect(measureText);

  return width;
};
