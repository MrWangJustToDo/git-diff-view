import { DiffFile as _DiffFile } from "@git-diff-view/core";

import type { Change } from "diff";

// TODO
export class DiffFile extends _DiffFile {
  #hasInitRaw: boolean = false;

  #hasInitSyntax: boolean = false;

  #hasBuildSplit: boolean = false;

  #hasBuildUnified: boolean = false;

  #diffResults?: Change[];

  // #doDiff() {
  //   this.#diffResults =
  // }

  initRaw() {
    if (this.#hasInitRaw) return;
    this.#hasInitRaw = true;
    this.initRaw();
  }

  init() {
    this.initRaw();
    this.initSyntax();
  }

  // setDiffOptions(options?: LinesOptions{}) {

  // }
}
