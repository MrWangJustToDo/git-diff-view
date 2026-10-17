import { DiffModeEnum, DiffView, type DiffViewWithMultiSelectRef } from "../../src/index";
import { useCallbackRef } from "../../src/hooks/useCallbackRef";
import { useUnmount } from "../../src/hooks/useUnmount";
import { useUpdateEffect } from "../../src/hooks/useUpdateEffect";
import { representativeDiff } from "../fixtures";

export type DiffViewHandle = Pick<DiffViewWithMultiSelectRef, "getDiffFileInstance">;

type DualDiffViewsProps = {
  firstMode: DiffModeEnum;
  onFirstRef: (value: DiffViewHandle | null) => void;
  onSecondRef: (value: DiffViewHandle | null) => void;
  showFirst: boolean;
};

const renderExtension = ({ data }: { data: string }) => <span data-extension={data}>{data}</span>;

export function DualDiffViews({ firstMode, onFirstRef, onSecondRef, showFirst }: DualDiffViewsProps) {
  return (
    <div>
      {showFirst ? (
        <section data-instance="first">
          <DiffView
            ref={onFirstRef}
            data={representativeDiff}
            diffViewFontSize={12}
            diffViewHighlight={false}
            diffViewMode={firstMode}
            diffViewTheme="dark"
            diffViewWrap
            extendData={{ newFile: { 1: { data: "first-extension" } } }}
            renderExtendLine={renderExtension}
          />
        </section>
      ) : null}
      <section data-instance="second">
        <DiffView
          ref={onSecondRef}
          data={representativeDiff}
          diffViewFontSize={18}
          diffViewHighlight={false}
          diffViewMode={DiffModeEnum.Split}
          diffViewTheme="light"
          diffViewWrap={false}
          extendData={{ oldFile: { 1: { data: "second-extension" } } }}
          renderExtendLine={renderExtension}
        />
      </section>
    </div>
  );
}

type HookLifecycleFixtureProps = {
  firstValue: number;
  onUnmount: (id: string) => void;
  onUpdate: (id: string, value: number) => void;
  showFirst: boolean;
};

function HookLifecycleProbe({
  id,
  onUnmount,
  onUpdate,
  value,
}: {
  id: string;
  onUnmount: (id: string) => void;
  onUpdate: (id: string, value: number) => void;
  value: number;
}) {
  const notifyUpdate = useCallbackRef(onUpdate);

  useUpdateEffect(() => notifyUpdate(id, value), [value]);
  useUnmount(() => onUnmount(id), [id]);

  return <span data-hook-probe={id}>{value}</span>;
}

export function HookLifecycleFixture({
  firstValue,
  onUnmount,
  onUpdate,
  showFirst,
}: HookLifecycleFixtureProps) {
  return (
    <div>
      {showFirst ? (
        <HookLifecycleProbe id="first" onUnmount={onUnmount} onUpdate={onUpdate} value={firstValue} />
      ) : null}
      <HookLifecycleProbe id="second" onUnmount={onUnmount} onUpdate={onUpdate} value={10} />
    </div>
  );
}
