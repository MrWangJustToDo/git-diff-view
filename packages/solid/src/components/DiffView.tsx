/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { _cacheMap, DiffFile, SplitSide, highlighter as buildInHighlighter } from "@git-diff-view/core";
import { diffFontSizeName, DiffModeEnum } from "@git-diff-view/utils";
import { type JSXElement, type JSX, createSignal, createEffect, createMemo, onCleanup, Show } from "solid-js";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffViewContext } from "./DiffViewContext";
import { DiffWidgetContext } from "./DiffWidgetContext";
import { createDiffConfigStore } from "./tools";

import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";

_cacheMap.name = "@git-diff-view/solid";

export { SplitSide, DiffModeEnum };

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T } | undefined>; newFile?: Record<string, { data: T } | undefined> };
  initialWidgetState?: { side: SplitSide; lineNumber: number };
  diffFile?: DiffFile;
  class?: string;
  style?: JSX.CSSProperties;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
  renderWidgetLine?: ({
    diffFile,
    side,
    lineNumber,
    onClose,
  }: {
    lineNumber: number;
    side: SplitSide;
    diffFile: DiffFile;
    onClose: () => void;
  }) => JSXElement;
  renderExtendLine?: ({
    diffFile,
    side,
    data,
    lineNumber,
    onUpdate,
  }: {
    lineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => JSXElement;
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};

type DiffViewProps_1<T> = Omit<DiffViewProps<T>, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    hunks: string[];
  };
};

type DiffViewProps_2<T> = Omit<DiffViewProps<T>, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  };
};

const InternalDiffView = <T extends unknown>(props: DiffViewProps<T>) => {
  const getInstance = () => {
    let diffFile: DiffFile | null = null;
    if (props.diffFile) {
      diffFile = DiffFile.createInstance({});
      diffFile._mergeFullBundle(props.diffFile._getFullBundle());
    } else if (props.data) {
      diffFile = new DiffFile(
        props.data.oldFile?.fileName || "",
        props.data.oldFile?.content || "",
        props.data.newFile?.fileName || "",
        props.data.newFile?.content || "",
        props.data.hunks || [],
        props.data.oldFile?.fileLang || "",
        props.data.newFile?.fileLang || ""
      );
    }

    onCleanup(() => diffFile?.clear?.());

    return diffFile;
  };

  const [wrapperRef, setWrapRef] = createSignal<HTMLDivElement | null>(null);

  const diffFile = createMemo(getInstance);

  const [isMounted, setIsMounted] = createSignal(false);

  createEffect(() => {
    setIsMounted(true);
  });

  const [widgetState, setWidgetState] = createSignal<{ side?: SplitSide; lineNumber?: number }>({
    side: props.initialWidgetState?.side,
    lineNumber: props.initialWidgetState?.lineNumber,
  });

  const reactiveHook = createDiffConfigStore(props, diffFile()?.getId() || "");

  createEffect(() => {
    const {
      setId,
      setDom,
      setEnableAddWidget,
      setEnableHighlight,
      setEnableWrap,
      setExtendData,
      setFontSize,
      setIsIsMounted,
      setMode,
      setOnAddWidgetClick,
      setRenderExtendLine,
      setRenderWidgetLine,
    } = reactiveHook.getReadonlyState();
    const currentDiffFile = diffFile();

    setId(currentDiffFile?.getId() || "");

    setEnableAddWidget(!!props.diffViewAddWidget);

    setEnableHighlight(!!props.diffViewHighlight);

    setEnableWrap(!!props.diffViewWrap);

    setFontSize(props.diffViewFontSize || 14);

    setIsIsMounted(isMounted());

    setMode(props.diffViewMode || DiffModeEnum.Split);

    setDom(wrapperRef() as HTMLElement);

    setOnAddWidgetClick({ current: props.onAddWidgetClick });

    setRenderExtendLine(props.renderExtendLine);

    setRenderWidgetLine(props.renderWidgetLine);

    setExtendData(props.extendData);
  });

  createEffect(() => {
    if (props.initialWidgetState) {
      setWidgetState({
        side: props.initialWidgetState.side,
        lineNumber: props.initialWidgetState.lineNumber,
      });
    }
  });

  const initSubscribe = () => {
    const mounted = isMounted();
    const currentDiffFile = diffFile();
    if (mounted && props.diffFile && currentDiffFile) {
      props.diffFile._addClonedInstance(currentDiffFile);
      onCleanup(() => props.diffFile?._delClonedInstance(currentDiffFile));
    }
  };

  const initDiff = () => {
    const mounted = isMounted();
    const currentDiffFile = diffFile();
    if (mounted && currentDiffFile) {
      currentDiffFile.initTheme(props.diffViewTheme);
      currentDiffFile.initRaw();
      currentDiffFile.buildSplitDiffLines();
      currentDiffFile.buildUnifiedDiffLines();
      // 看起来solid的 effect 调用无法保证顺序？
      currentDiffFile.notifyAll();
    }
  };

  const initSyntax = () => {
    const mounted = isMounted();
    const currentDiffFile = diffFile();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.diffViewTheme;
    if (mounted && currentDiffFile) {
      if (props.diffViewHighlight) {
        const finalHighlighter = props.registerHighlighter || buildInHighlighter;
        if (
          finalHighlighter.name !== currentDiffFile._getHighlighterName() ||
          finalHighlighter.type !== currentDiffFile._getHighlighterType()
        ) {
          currentDiffFile.initSyntax({ registerHighlighter: finalHighlighter });
          currentDiffFile.notifyAll();
        } else {
          currentDiffFile.initSyntax({ registerHighlighter: finalHighlighter });
          if (finalHighlighter.type !== "class") currentDiffFile.notifyAll();
        }
      }
    }
  };

  const initAttribute = () => {
    const mounted = isMounted();
    const currentDiffFile = diffFile();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.diffViewTheme;
    if (mounted && currentDiffFile && wrapperRef()) {
      const init = () => {
        wrapperRef()?.setAttribute("data-theme", currentDiffFile._getTheme() || "light");
        wrapperRef()?.setAttribute("data-highlighter", currentDiffFile._getHighlighterName());
      };

      init();

      const cb = currentDiffFile.subscribe(init);

      onCleanup(() => cb());
    }
  };

  createEffect(initSubscribe);

  createEffect(initDiff);

  createEffect(initSyntax);

  createEffect(initAttribute);

  onCleanup(() => reactiveHook.clear());

  return (
    <Show when={diffFile()}>
      <div
        class="diff-tailwindcss-wrapper"
        data-component="git-diff-view"
        data-theme={diffFile()?._getTheme?.() || "light"}
        data-version={__VERSION__}
        data-highlighter={diffFile()?._getHighlighterName?.()}
        ref={setWrapRef}
      >
        <DiffViewContext.Provider value={reactiveHook}>
          <DiffWidgetContext.Provider value={[widgetState, setWidgetState]}>
            <div class="diff-style-root" style={{ [diffFontSizeName]: (props.diffViewFontSize || 14) + "px" }}>
              <div
                id={isMounted() ? `diff-root${diffFile()?.getId()}` : undefined}
                class={"diff-view-wrapper" + (props.class ? ` ${props.class}` : "")}
                style={props.style}
              >
                {!props.diffViewMode || props.diffViewMode & DiffModeEnum.Split ? (
                  <DiffSplitView diffFile={diffFile() as DiffFile} />
                ) : (
                  <DiffUnifiedView diffFile={diffFile() as DiffFile} />
                )}
              </div>
            </div>
          </DiffWidgetContext.Provider>
        </DiffViewContext.Provider>
      </div>
    </Show>
  );
};

function SolidDiffView<T>(props: DiffViewProps_1<T>): JSXElement;
function SolidDiffView<T>(props: DiffViewProps_2<T>): JSXElement;
function SolidDiffView<T>(props: DiffViewProps<T>): JSXElement {
  return <InternalDiffView {...props} />;
}

export const DiffView = SolidDiffView;
