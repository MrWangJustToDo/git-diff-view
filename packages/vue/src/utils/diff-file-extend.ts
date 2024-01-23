import { DiffFile } from "@git-diff-view/core";

import type { SplitSide } from "../context";

export class DiffFileExtends extends DiffFile {
  #widgetSide?: SplitSide;

  #widgetLineNumber?: number;

  constructor(...args) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(...args);
    Object.defineProperty(this, "__v_skip", { value: true });
  }

  onOpenAddWidget = (lineNumber: number, side: SplitSide) => {
    this.#widgetSide = side;
    this.#widgetLineNumber = lineNumber;

    this.notifyAll();
  };

  checkWidgetLine = (lineNumber: number, side: SplitSide) => {
    if (side === this.#widgetSide && lineNumber === this.#widgetLineNumber) {
      return true;
    }
  };

  onCloseAddWidget = () => {
    this.#widgetSide = undefined;
    this.#widgetLineNumber = undefined;

    this.notifyAll();
  };
}
