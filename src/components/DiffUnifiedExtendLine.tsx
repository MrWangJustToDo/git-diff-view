import { DiffFileExtends } from "../diff";

export const DiffUnifiedExtendLine = ({
  index,
  diffFile,
  isWrap,
}: {
  index: number;
  diffFile: DiffFileExtends;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const currentExtend = diffFile.getUnifiedExtendLine(index);

  if (!currentExtend) return null;

  return (
    <tr
      data-state="extend"
      className="diff-line diff-line-extend"
    >
      <td
        className="diff-line-extend-content"
        style={{ position: isWrap ? "relative" : "sticky" }}
        colSpan={4}
      >
        {currentExtend}
      </td>
    </tr>
  );
};
