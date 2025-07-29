import { Box, Text } from "ink";
import * as React from "react";

import { SplitSide } from "..";

import { diffEmptyContent } from "./color";
import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFile } from "@git-diff-view/core";

const InternalDiffSplitExtendLine = ({
  index,
  columns,
  theme,
  diffFile,
  lineNumber,
  oldLineExtend,
  newLineExtend,
}: {
  index: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
  oldLineExtend: { data: any };
  newLineExtend: { data: any };
}) => {
  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  // 需要显示的时候才进行方法订阅，可以大幅度提高性能
  const renderExtendLine = useDiffContext.useShallowStableSelector((s) => s.renderExtendLine);

  if (!renderExtendLine) return null;

  const oldExtendRendered =
    oldLineExtend?.data &&
    renderExtendLine?.({
      diffFile,
      side: SplitSide.old,
      lineNumber: oldLine.lineNumber,
      data: oldLineExtend.data,
      onUpdate: diffFile.notifyAll,
    });

  const newExtendRendered =
    newLineExtend?.data &&
    renderExtendLine?.({
      diffFile,
      side: SplitSide.new,
      lineNumber: newLine.lineNumber,
      data: newLineExtend.data,
      onUpdate: diffFile.notifyAll,
    });

  const bgColor = theme === "light" ? diffEmptyContent.light : diffEmptyContent.dark;

  return (
    <Box data-line={`${lineNumber}-extend`} data-state="extend">
      <Box width={columns / 2} flexShrink={0} flexGrow={0} backgroundColor={oldExtendRendered ? undefined : bgColor}>
        {React.isValidElement(oldExtendRendered) ? oldExtendRendered : <Text>{oldExtendRendered}</Text>}
      </Box>
      <Box width={columns / 2} flexShrink={0} flexGrow={0} backgroundColor={newExtendRendered ? undefined : bgColor}>
        {React.isValidElement(newExtendRendered) ? newExtendRendered : <Text>{newExtendRendered}</Text>}
      </Box>
    </Box>
  );
};

export const DiffSplitExtendLine = ({
  index,
  columns,
  theme,
  diffFile,
  lineNumber,
}: {
  index: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const { oldLineExtend, newLineExtend } = useDiffContext(
    React.useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[oldLine?.lineNumber],
        newLineExtend: s.extendData?.newFile?.[newLine?.lineNumber],
      }),
      [oldLine?.lineNumber, newLine?.lineNumber]
    )
  );

  const hasExtend = oldLineExtend?.data || newLineExtend?.data;

  // if the expand action not enabled, the `isHidden` property will never change
  const enableExpand = diffFile.getExpandEnabled();

  const currentIsShow = hasExtend && ((!oldLine?.isHidden && !newLine?.isHidden) || !enableExpand);

  if (!currentIsShow) return null;

  return (
    <InternalDiffSplitExtendLine
      index={index}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      oldLineExtend={oldLineExtend}
      newLineExtend={newLineExtend}
    />
  );
};
