import { Box, Text } from "ink";
import * as React from "react";

import { useCodeViewContext } from "./CodeViewContext";

import type { File } from "@git-diff-view/core";

const InternalCodeExtendLine = ({
  columns,
  lineNumber,
  lineExtend,
  file,
}: {
  columns: number;
  lineNumber: number;
  lineExtend: { data: any };
  file: File;
}) => {
  const { useCodeContext } = useCodeViewContext();

  const renderExtendLine = useCodeContext((s) => s.renderExtendLine);

  if (!renderExtendLine) return null;

  const extendRendered =
    lineExtend?.data &&
    renderExtendLine?.({
      file,
      lineNumber,
      data: lineExtend.data,
    });

  return (
    <Box data-line={`${lineNumber}-extend`} data-state="extend" width={columns}>
      {React.isValidElement(extendRendered) ? extendRendered : <Text>{extendRendered}</Text>}
    </Box>
  );
};

export const CodeExtendLine = ({ columns, lineNumber, file }: { columns: number; lineNumber: number; file: File }) => {
  const { useCodeContext } = useCodeViewContext();

  const lineExtend = useCodeContext(React.useCallback((s) => s.extendData?.[lineNumber], [lineNumber]));

  if (!lineExtend?.data) return null;

  return <InternalCodeExtendLine columns={columns} lineNumber={lineNumber} lineExtend={lineExtend} file={file} />;
};
