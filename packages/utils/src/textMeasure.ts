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

let instance: TextMeasure | null = null;

export const getTextMeasureInstance = () => {
  instance = instance || new TextMeasure();

  return instance;
};
