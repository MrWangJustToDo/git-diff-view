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
import { Button, Group } from "@mantine/core";
import { useEffect } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";

const transform = (str: string) =>
  escapeHtml(str)
    .replace(/ /g, '<span class="diff-symbol diff-symbol-space"> </span>')
    .replace(/\t/g, '<span class="diff-symbol diff-symbol-tab">\t</span>');

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
    <Group>
      <Button onClick={() => setTabSpace(!tabSpace)}>
        {tabSpace ? "disable tab/space symbol" : "enable tab/space symbol"}
      </Button>
      <Button onClick={() => setFastDiff(!fastDiff)}>
        {fastDiff ? "disable fast diff template" : "enable fast diff template"}
      </Button>
      <Button disabled={!fastDiff} onClick={() => setSemanticCleanup(!semanticCleanup)}>
        {semanticCleanup ? "disable semantic cleanup" : "enable semantic cleanup"}
      </Button>
      <Button onClick={() => setAutoExpandCommentLine(!autoExpandCommentLine)}>
        {autoExpandCommentLine ? "disable auto expand comment line" : "enable auto expand comment line"}
      </Button>
    </Group>
  );
};
