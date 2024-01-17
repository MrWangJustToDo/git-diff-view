import { Fragment } from "react";
import { DiffFile, DiffFileExtends, numIterator } from "../diff";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import {
  DiffUnifiedExpandLastLine,
  DiffUnifiedHunkLine,
} from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";

export const DiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { isWrap, isHighlight } = useDiffViewContext();

  const unifiedLineLength = diffFile.unifiedLineLength;

  return (
    <div className="unified-diff-view w-full">
      <div className="unified-diff-table-wrapper overflow-auto w-full">
        <table className="unified-diff-table border-collapse w-full">
          <colgroup>
            <col className="unified-diff-table-num-col" />
            <col className="unified-diff-table-content-col" />
          </colgroup>
          <thead className="hidden">
            <tr>
              <th scope="col">line number</th>
              <th scope="col">line content</th>
            </tr>
          </thead>
          <tbody
            className="leading-[1.4]"
            style={{
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            {numIterator(unifiedLineLength, (index) => (
              <Fragment key={index}>
                <DiffUnifiedHunkLine
                  index={index}
                  lineNumber={index + 1}
                  isHighlight={isHighlight}
                  isWrap={isWrap}
                  diffFile={diffFile}
                />
                <DiffUnifiedLine
                  index={index}
                  lineNumber={index + 1}
                  isHighlight={isHighlight}
                  isWrap={isWrap}
                  diffFile={diffFile}
                />
                <DiffUnifiedExtendLine
                  index={index}
                  lineNumber={index + 1}
                  isHighlight={isHighlight}
                  isWrap={isWrap}
                  diffFile={diffFile as DiffFileExtends}
                />
              </Fragment>
            ))}
            <DiffUnifiedExpandLastLine
              isWrap={isWrap}
              diffFile={diffFile}
              isHighlight={isHighlight}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};
