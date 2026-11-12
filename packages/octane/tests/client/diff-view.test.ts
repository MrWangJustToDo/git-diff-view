import { render, waitFor } from "@octanejs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { DiffModeEnum, DiffView, DiffViewWithMultiSelect, type DiffViewWithMultiSelectRef } from "../../src";
import { representativeDiff } from "../fixtures";

import { DualDiffViews, HookLifecycleFixture, type DiffViewHandle } from "./fixtures.tsrx";

describe("@git-diff-view/octane DiffView", () => {
  it("renders the representative unified diff with theme, wrapping and font configuration", async () => {
    const view = render(DiffView, {
      props: {
        data: representativeDiff,
        diffViewFontSize: 12,
        diffViewHighlight: false,
        diffViewMode: DiffModeEnum.Unified,
        diffViewTheme: "dark" as const,
        diffViewWrap: true,
      },
    });

    await waitFor(() => expect(view.container.querySelector(".unified-diff-view")).not.toBeNull());

    const root = view.container.querySelector('[data-component="git-diff-view"]');
    expect(root?.getAttribute("data-theme")).toBe("dark");
    expect(view.container.querySelector(".unified-diff-view-wrap")).not.toBeNull();
    expect(view.container.querySelector(".diff-style-root")?.getAttribute("style")).toContain("12px");
    expect(view.container.textContent).toContain("export const value");
    expect(view.container.textContent).toContain("stable");
  });

  it("updates from unified to split mode without replacing the public component", async () => {
    const baseProps = {
      data: representativeDiff,
      diffViewHighlight: false,
      diffViewMode: DiffModeEnum.Unified,
    };
    const view = render(DiffView, { props: baseProps });

    await waitFor(() => expect(view.container.querySelector(".unified-diff-view")).not.toBeNull());
    view.rerender({ props: { ...baseProps, diffViewMode: DiffModeEnum.Split } });

    await waitFor(() => expect(view.container.querySelector(".split-diff-view")).not.toBeNull());
    expect(view.container.querySelector(".unified-diff-view")).toBeNull();
    expect(view.container.querySelector(".old-diff-table")).not.toBeNull();
    expect(view.container.querySelector(".new-diff-table")).not.toBeNull();
  });

  it("exposes and clears the imperative DiffFile handle", async () => {
    let handle: { getDiffFileInstance: () => unknown } | null = null;
    const view = render(DiffView, {
      props: {
        data: representativeDiff,
        diffViewHighlight: false,
        diffViewMode: DiffModeEnum.Unified,
        ref: (value: typeof handle) => {
          handle = value;
        },
      },
    });

    await waitFor(() => expect(handle?.getDiffFileInstance()).not.toBeNull());
    view.unmount();
    expect(handle).toBeNull();
  });

  it("renders the multi-select adapter and exposes its complete imperative surface", async () => {
    const handle: { current: DiffViewWithMultiSelectRef | null } = { current: null };
    const view = render(DiffViewWithMultiSelect, {
      props: {
        data: representativeDiff,
        diffViewHighlight: false,
        diffViewMode: DiffModeEnum.Unified,
        ref: (value: DiffViewWithMultiSelectRef | null) => {
          handle.current = value;
        },
      },
    });

    await waitFor(() => expect(handle.current?.getDiffFileInstance()).not.toBeNull());
    expect(view.container.querySelector(".diff-multiselect-wrapper")).not.toBeNull();
    expect(handle.current?.getSelectionResult()).toBeNull();
    expect(handle.current?.getSelectionState()).toMatchObject({ isSelecting: false });
    handle.current?.clearSelection();
    handle.current?.setPreselectedLines({ old: [1], new: [1] });
  });

  it("isolates contexts, resize observers and state across sibling instances and remounts", async () => {
    const firstHandle: { current: DiffViewHandle | null } = { current: null };
    const secondHandle: { current: DiffViewHandle | null } = { current: null };
    const props = {
      firstMode: DiffModeEnum.Unified,
      onFirstRef: (value: DiffViewHandle | null) => {
        firstHandle.current = value;
      },
      onSecondRef: (value: DiffViewHandle | null) => {
        secondHandle.current = value;
      },
      showFirst: true,
    };
    const view = render(DualDiffViews, { props });

    await waitFor(() => {
      expect(view.container.querySelector('[data-instance="first"] [data-extension="first-extension"]')).not.toBeNull();
      expect(
        view.container.querySelector('[data-instance="second"] [data-extension="second-extension"]')
      ).not.toBeNull();
    });

    const first = view.container.querySelector('[data-instance="first"]')!;
    const second = view.container.querySelector('[data-instance="second"]')!;
    expect(first.querySelector('[data-component="git-diff-view"]')?.getAttribute("data-theme")).toBe("dark");
    expect(second.querySelector('[data-component="git-diff-view"]')?.getAttribute("data-theme")).toBe("light");
    expect(first.querySelector(".unified-diff-view")).not.toBeNull();
    expect(second.querySelector(".split-diff-view")).not.toBeNull();
    expect(first.querySelector("[data-observe]")).not.toBeNull();
    expect(second.querySelector("[data-observe]")).not.toBeNull();

    const originalFirstFile = firstHandle.current?.getDiffFileInstance();
    const originalSecondFile = secondHandle.current?.getDiffFileInstance();
    expect(originalFirstFile).not.toBe(originalSecondFile);

    view.rerender({ props: { ...props, firstMode: DiffModeEnum.Split } });
    await waitFor(() =>
      expect(view.container.querySelector('[data-instance="first"] .split-diff-view')).not.toBeNull()
    );
    expect(view.container.querySelector('[data-instance="second"] .split-diff-view')).not.toBeNull();
    expect(secondHandle.current?.getDiffFileInstance()).toBe(originalSecondFile);

    view.rerender({ props: { ...props, firstMode: DiffModeEnum.Split, showFirst: false } });
    await waitFor(() => expect(firstHandle.current).toBeNull());
    expect(view.container.querySelector('[data-instance="first"]')).toBeNull();
    expect(view.container.querySelector('[data-instance="second"] [data-observe]')).not.toBeNull();
    expect(secondHandle.current?.getDiffFileInstance()).toBe(originalSecondFile);

    view.rerender({ props });
    await waitFor(() => expect(firstHandle.current?.getDiffFileInstance()).not.toBeNull());
    expect(firstHandle.current?.getDiffFileInstance()).not.toBe(originalFirstFile);
    expect(secondHandle.current?.getDiffFileInstance()).toBe(originalSecondFile);
  });

  it("keeps callback, update-effect and unmount hook state independent", async () => {
    const onUpdate = vi.fn<(id: string, value: number) => void>();
    const onUnmount = vi.fn<(id: string) => void>();
    const props = { firstValue: 1, onUnmount, onUpdate, showFirst: true };
    const view = render(HookLifecycleFixture, { props });

    expect(onUpdate).not.toHaveBeenCalled();
    view.rerender({ props: { ...props, firstValue: 2 } });
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith("first", 2));
    expect(onUpdate).not.toHaveBeenCalledWith("second", expect.anything());

    view.rerender({ props: { ...props, firstValue: 2, showFirst: false } });
    await waitFor(() => expect(onUnmount).toHaveBeenCalledWith("first"));
    expect(view.container.querySelector('[data-hook-probe="second"]')?.textContent).toBe("10");
    expect(onUnmount).not.toHaveBeenCalledWith("second");

    view.rerender({ props });
    view.rerender({ props: { ...props, firstValue: 3 } });
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith("first", 3));
    expect(onUpdate.mock.calls.filter(([id]) => id === "second")).toHaveLength(0);
  });
});
