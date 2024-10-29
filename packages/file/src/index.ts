import { DiffFile, _cacheMap } from "@git-diff-view/core";
import { createTwoFilesPatch, type LinesOptions } from "diff";

_cacheMap.name = "@git-diff-view/file";

export const generateDiffFile = (
  oldFileName: string,
  oldFileContent: string,
  newFileName: string,
  newFileContent: string,
  oldFileLang: string,
  newFileLang: string,
  option?: LinesOptions,
  uuid?: string
) => {
  const diffString = createTwoFilesPatch(oldFileName, newFileName, oldFileContent, newFileContent, "", "", option);

  return new DiffFile(
    oldFileName,
    oldFileContent,
    newFileName,
    newFileContent,
    [diffString],
    oldFileLang,
    newFileLang,
    uuid
  );
};

export * from "@git-diff-view/core";
