import { ref, watchPostEffect } from "vue";

import { useIsMounted } from "./useIsMounted";

import type { Ref } from "vue";

let canvasCtx: CanvasRenderingContext2D | null = null;

const getKey = (font: { fontFamily?: string; fontStyle?: string; fontSize?: string }, text: string) => {
  return `${font.fontFamily}-${font.fontStyle}-${font.fontSize}-${text}`;
};

const getStableKey = (font: { fontFamily?: string; fontStyle?: string; fontSize?: string }, text: string) => {
  return getKey(font, "0".repeat(text.length));
};

class TextMeasure {
  #key: string = "";

  #map: Record<string, number> = {};

  #getInstance(): CanvasRenderingContext2D {
    canvasCtx = canvasCtx || document.createElement("canvas").getContext("2d");
    return canvasCtx!;
  }

  measure(text: string, font?: { fontFamily?: string; fontStyle?: string; fontSize?: string }) {
    const currentKey = getStableKey(font, text);
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

  const fontSize = parseInt(font.value.fontSize);

  let baseSize = 6;
  
  baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;

  const width = ref(baseSize * text.value.length);

  const measureText = () => {
    if (!isMounted.value) return;
    width.value = measureInstance.measure(text.value || "", font.value);
  };

  watchPostEffect(measureText);

  return width;
};
