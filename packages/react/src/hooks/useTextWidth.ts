import { useState } from "react";

import { useSafeLayout } from "./useSafeLayout";

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
  text: string;
  font: { fontFamily?: string; fontStyle?: string; fontSize?: string };
}) => {
  const [width, setWidth] = useState(0);

  useSafeLayout(() => {
    const width = measureInstance.measure(text, font);

    setWidth(width);
  }, [text, font]);

  return width;
};
