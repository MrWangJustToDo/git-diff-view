import { SandpackCodeEditor, SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react";
import { DiffModeEnum } from "@git-diff-view/react";
import { useMantineColorScheme } from "@mantine/core";
import { memo } from "react";

import { useDiffConfig } from "../../hooks/useDiffConfig";

const getCode = ({ theme, type }: { theme: "light" | "dark"; type: "react" | "vue" }) => {
  return type === "react"
    ? `import { DiffView, DiffFile, DiffModeEnum } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/react/styles/diff-view.css";
// or if you have your own tailwindcss setup
import "@git-diff-view/react/styles/diff-view-pure.css";

// git mode, use \`git diff\` output to render
const getDiffFile = () => {
  // see https://git-scm.com/docs/git-diff
  const instance = new DiffFile(oldFileName, oldContent, newFileName, newContent, [ git diff output string ]);
  instance.initRaw();
  return instance;
}

// file mode, use \`string content\` to render
const getDiffFile = () => {
  const instance = generateDiffFile(oldFileName, oldContent, newFileName, newContent, '', '');
  instance.initRaw();
  return instance;
}

const App = () => {
  const [diffFile, setDiffFile] = useState(() => getDiffFile());

  return <DiffView diffFile={diffFile} diffViewWrap={${String(useDiffConfig.getReadonlyState().wrap)}} diffViewTheme={"${theme}"} diffViewHighlight={${String(useDiffConfig.getReadonlyState().highlight)}} diffViewMode={DiffModeEnum.${DiffModeEnum[useDiffConfig.getReadonlyState().mode]}} />;
}`
    : `<script setup lang="ts">
  import { DiffView, DiffFile, DiffModeEnum } from "@git-diff-view/vue";
  import { generateDiffFile } from "@git-diff-view/file";
  import "@git-diff-view/vue/styles/diff-view.css";
  // or if you have your own tailwindcss setup
  import "@git-diff-view/react/styles/diff-view-pure.css";

  // git mode, use \`git diff\` output to render
  const getDiffFile = () => {
    // see https://git-scm.com/docs/git-diff
    const instance = new DiffFile(oldFileName, oldContent, newFileName, newContent, [ git diff output string ]);
    instance.initRaw();
    return instance;
  }

  // file mode, use \`string content\` to render
  const getDiffFile = () => {
    const instance = generateDiffFile(oldFileName, oldContent, newFileName, newContent, '', '');
    instance.initRaw();
    return instance;
  }

</script>
<template>
  <DiffView :diffFile="getDiffFile()" :diffViewWrap="${String(useDiffConfig.getReadonlyState().wrap)}" :diffViewTheme="${theme}" :diffViewHighlight="${String(useDiffConfig.getReadonlyState().highlight)}" :diffViewMode="DiffModeEnum.${DiffModeEnum[useDiffConfig.getReadonlyState().mode]}" />
</template>`;
};

export const MainContentDiffExampleCode = memo(({ type = "react" }: { type?: "react" | "vue" }) => {
  const { colorScheme } = useMantineColorScheme();

  useDiffConfig();

  const code = getCode({ theme: colorScheme === "dark" ? "dark" : "light", type });

  return (
    <SandpackProvider
      files={{
        [`main.${type === "react" ? "tsx" : "vue"}`]: {
          code,
          active: true,
        },
      }}
      theme={colorScheme === "dark" ? "dark" : "light"}
      className="!h-full"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      style={{ ["--sp-layout-height"]: "100%" }}
    >
      <SandpackLayout className="code-preview h-full border-none">
        <SandpackCodeEditor showLineNumbers={code.split("\n").length > 1} showReadOnly={false} readOnly />
      </SandpackLayout>
    </SandpackProvider>
  );
});

MainContentDiffExampleCode.displayName = "MainContentDiffExampleCode";
