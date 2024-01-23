import { watchEffect } from "vue";

import type { DiffFile } from "@git-diff-view/core";

export const useSubscribeDiffFile = (props: { diffFile: DiffFile }, onUpdate: (instance: DiffFile) => void) => {
  const initSubscribe = (onClean: (cb: () => void) => void) => {
    const diffFile = props.diffFile;

    const clean = diffFile.subscribe(() => onUpdate(diffFile));

    onClean(clean);
  };

  watchEffect(initSubscribe);
};
