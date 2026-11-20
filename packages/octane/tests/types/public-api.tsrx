import { useRef } from "octane";

import {
  type DiffFile,
  DiffModeEnum,
  DiffView,
  DiffViewWithMultiSelect,
  type DiffViewWithMultiSelectRef,
} from "../../src/index";
import { representativeDiff } from "../fixtures";

export function PublicApiFixture() {
  const diffRef = useRef<{ getDiffFileInstance: () => DiffFile | null } | null>(null);
  const multiSelectRef = useRef<DiffViewWithMultiSelectRef | null>(null);

  return (
    <>
      <DiffView
        ref={diffRef}
        data={representativeDiff}
        diffViewMode={DiffModeEnum.Unified}
        diffViewTheme="dark"
        diffViewWrap
        diffViewHighlight
        diffViewFontSize={12}
      />
      <DiffViewWithMultiSelect ref={multiSelectRef} data={representativeDiff} />
    </>
  );
}
