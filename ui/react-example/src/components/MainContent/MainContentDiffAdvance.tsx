import {
  escapeHtml,
  setTransformForTemplateContent,
  resetTransform,
  setEnableFastDiffTemplate,
  resetEnableFastDiffTemplate,
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
    shadowDOM,
    setShadowDOM,
    autoExpandCommentLine,
    setAutoExpandCommentLine,
  } = useDiffConfig((s) => ({
    tabSpace: s.tabSpace,
    setTabSpace: s.setTabSpace,
    fastDiff: s.fastDiff,
    setFastDiff: s.setFastDiff,
    shadowDOM: s.shadowDOM,
    setShadowDOM: s.setShadowDOM,
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
    if (fastDiff) {
      setEnableFastDiffTemplate(true);
    } else {
      resetEnableFastDiffTemplate();
    }
  }, [fastDiff]);

  useEffect(() => {
    return () => {
      resetTransform();
      resetEnableFastDiffTemplate();
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
      <Button onClick={() => setShadowDOM(!shadowDOM)}>{shadowDOM ? "disable shadow DOM" : "enable shadow DOM"}</Button>
      <Button onClick={() => setAutoExpandCommentLine(!autoExpandCommentLine)}>
        {autoExpandCommentLine ? "disable auto expand comment line" : "enable auto expand comment line"}
      </Button>
    </Group>
  );
};
