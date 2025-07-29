import { Box, Text } from "ink";
import * as React from "react";
import { useCallback } from "react";

import { SplitSide } from "..";

import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFile } from "@git-diff-view/core";

const InternalDiffUnifiedExtendLine = ({
  index,
  columns,
  diffFile,
  lineNumber,
  oldLineExtend,
  newLineExtend,
}: {
  index: number;
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  theme: "light" | "dark";
  oldLineExtend: { data: any };
  newLineExtend: { data: any };
}) => {
  const { useDiffContext } = useDiffViewContext();

  const renderExtendLine = useDiffContext.useShallowStableSelector((s) => s.renderExtendLine);

  const unifiedItem = diffFile.getUnifiedLine(index);

  if (!renderExtendLine) return null;

  const oldExtendRendered =
    oldLineExtend?.data !== null &&
    oldLineExtend?.data !== undefined &&
    renderExtendLine?.({
      diffFile,
      side: SplitSide.old,
      lineNumber: unifiedItem.oldLineNumber,
      data: oldLineExtend.data,
      onUpdate: diffFile.notifyAll,
    });

  const newExtendRendered =
    newLineExtend?.data !== null &&
    newLineExtend?.data !== undefined &&
    renderExtendLine?.({
      diffFile,
      side: SplitSide.new,
      lineNumber: unifiedItem.newLineNumber,
      data: newLineExtend.data,
      onUpdate: diffFile.notifyAll,
    });

  return (
    <Box data-line={`${lineNumber}-extend`} data-state="extend" width={columns}>
      {oldExtendRendered && (
        <Box width={columns} flexShrink={0} flexGrow={0}>
          {!React.isValidElement(oldExtendRendered) ? <Text>{oldExtendRendered}</Text> : oldExtendRendered}
        </Box>
      )}
      {newExtendRendered && (
        <Box width={columns} flexShrink={0} flexGrow={0}>
          {!React.isValidElement(newExtendRendered) ? <Text>{newExtendRendered}</Text> : newExtendRendered}
        </Box>
      )}
    </Box>
  );
};

export const DiffUnifiedExtendLine = ({
  index,
  theme,
  columns,
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

  const unifiedItem = diffFile.getUnifiedLine(index);

  const { oldLineExtend, newLineExtend } = useDiffContext(
    useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[unifiedItem?.oldLineNumber],
        newLineExtend: s.extendData?.newFile?.[unifiedItem?.newLineNumber],
      }),
      [unifiedItem.oldLineNumber, unifiedItem.newLineNumber]
    )
  );

  const hasExtend = oldLineExtend?.data || newLineExtend?.data;

  if (!hasExtend || !unifiedItem || unifiedItem.isHidden) return null;

  return (
    <InternalDiffUnifiedExtendLine
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
