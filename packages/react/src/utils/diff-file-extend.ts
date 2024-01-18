import { DiffFile } from "@git-diff-view/core";

import type { ReactNode } from "react";

export class DiffFileExtends extends DiffFile {
  #splitLeftExtendLines: Record<string, ReactNode> = {};

  #splitRightExtendLines: Record<string, ReactNode> = {};

  #unifiedExtendLines: Record<string, ReactNode> = {};

  getSplitExtendLine = (index: number, side: "left" | "right") => {
    if (side === "left") {
      return this.#splitLeftExtendLines[index];
    } else {
      return this.#splitRightExtendLines[index];
    }
  };

  getUnifiedExtendLine = (index: number) => {
    return this.#unifiedExtendLines[index];
  };

  removeSplitExtendLine = (index: number, side: "left" | "right") => {
    if (side === "left") {
      delete this.#splitLeftExtendLines[index];
    } else {
      delete this.#splitRightExtendLines[index];
    }

    this.notifyAll();
  };

  addSplitExtendLine = (index: number, side: "left" | "right", element: ReactNode) => {
    if (side === "left") {
      this.#splitLeftExtendLines[index] = element;
    } else {
      this.#splitRightExtendLines[index] = element;
    }

    this.notifyAll();
  };

  removeUnifiedExtendLine = (index: number) => {
    delete this.#unifiedExtendLines[index];

    this.notifyAll();
  };

  addUnifiedLine = (index: number, element: ReactNode) => {
    this.#unifiedExtendLines[index] = element;

    this.notifyAll();
  };
}
