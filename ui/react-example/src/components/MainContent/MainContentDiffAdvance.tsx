import {
  escapeHtml,
  setTransformForTemplateContent,
  resetTransform,
  setEnableBuildTemplate,
  setEnableFastDiffTemplate,
  resetEnableFastDiffTemplate,
  setEnableDiffSemanticCleanup,
  resetEnableDiffSemanticCleanup,
} from "@git-diff-view/core";
import { useEffect } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";

const transform = (str: string) =>
  escapeHtml(str)
    .replace(/ /g, '<span class="diff-symbol diff-symbol-space"> </span>')
    .replace(/\t/g, '<span class="diff-symbol diff-symbol-tab">\t</span>');

/** Same one-option-per-line treatment as the configuration panel. */
const Flag = ({
  flag,
  on,
  disabled,
  onClick,
}: {
  flag: string;
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button type="button" disabled={disabled} onClick={onClick} className={`flag ${on ? "flag-on" : "flag-off"}`}>
    <span className="w-3 shrink-0 text-center opacity-60">{on ? "+" : "−"}</span>
    <span>{flag}</span>
  </button>
);

export const MainContentDiffAdvance = () => {
  const {
    tabSpace,
    setFastDiff,
    setTabSpace,
    fastDiff,
    semanticCleanup,
    setSemanticCleanup,
    autoExpandCommentLine,
    setAutoExpandCommentLine,
  } = useDiffConfig((s) => ({
    tabSpace: s.tabSpace,
    setTabSpace: s.setTabSpace,
    fastDiff: s.fastDiff,
    setFastDiff: s.setFastDiff,
    semanticCleanup: s.semanticCleanup,
    setSemanticCleanup: s.setSemanticCleanup,
    autoExpandCommentLine: s.autoExpandCommentLine,
    setAutoExpandCommentLine: s.setAutoExpandCommentLine,
  }));

  useEffect(() => {
    if (tabSpace) {
      setTransformForTemplateContent(transform);
    } else {
      resetTransform();
    }
  }, [tabSpace]);

  useEffect(() => {
    // 因为我们引入了 cli 组件，默认会禁用这个选项，此处开启
    setEnableBuildTemplate(true);
    if (fastDiff) {
      setEnableFastDiffTemplate(true);
    } else {
      resetEnableFastDiffTemplate();
    }
  }, [fastDiff]);

  useEffect(() => {
    if (semanticCleanup) {
      setEnableDiffSemanticCleanup(true);
    } else {
      resetEnableDiffSemanticCleanup();
    }
  }, [semanticCleanup]);

  useEffect(() => {
    return () => {
      resetTransform();
      resetEnableFastDiffTemplate();
      resetEnableDiffSemanticCleanup();
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <Flag flag="symbols" on={tabSpace} onClick={() => setTabSpace(!tabSpace)} />
      <Flag flag="fast-diff" on={fastDiff} onClick={() => setFastDiff(!fastDiff)} />
      <Flag
        flag="semantic-cleanup"
        on={semanticCleanup}
        disabled={!fastDiff}
        onClick={() => setSemanticCleanup(!semanticCleanup)}
      />
      <Flag
        flag="auto-expand-comment"
        on={autoExpandCommentLine}
        onClick={() => setAutoExpandCommentLine(!autoExpandCommentLine)}
      />
    </div>
  );
};
