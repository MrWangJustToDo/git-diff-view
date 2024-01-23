import { ref } from "vue";

import { useSubscribeDiffFile } from "./useSubscribeDiffFile";

import type { DiffFile } from "@git-diff-view/core";

export const useForceUpdate = (props: { diffFile: DiffFile }) => {
  const count = ref(0);

  useSubscribeDiffFile(props, (diffFile) => (count.value = diffFile.getUpdateCount()));

  return count;
};
