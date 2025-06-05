/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Box, Card, useMantineColorScheme } from "@mantine/core";
import { IconBrandVue } from "@tabler/icons-react";

// import { Vue } from "./icons";
import { f1, f2 } from "./ReactPlayGround";

export const VuePlayGround = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card className="p-0" withBorder>
      <Box className="flex items-center px-2 py-2 font-sans text-[14px]">
        <IconBrandVue size="16" color="#42b883" className="mr-2" />Vue
      </Box>
      <SandpackProvider
        template="vite-vue-ts"
        customSetup={{
          dependencies: {
            "@git-diff-view/file": "0.0.26",
            "@git-diff-view/vue": "0.0.26",
          },
        }}
        files={{
          "/src/App.vue": `<script setup lang='ts'>
  import { DiffModeEnum, DiffView, DiffViewProps, SplitSide, DiffFile } from "@git-diff-view/vue";
  import { generateDiffFile } from "@git-diff-view/file";
  import { ref, computed } from 'vue';
  import "@git-diff-view/vue/styles/diff-view.css";

  const temp1 = ref(\`${f1}\`);
  const temp2 = ref(\`${f2}\`);

  const getDiffFile = () => {
    const instance = generateDiffFile(
      "oldFileName",
      temp1.value,
      "newFileName",
      temp2.value,
      "tsx",
      "tsx"
    );
    instance.initRaw();
    return instance;
  };

  const diffFile: DiffFile = computed(() => getDiffFile());
</script>
<template>
  <DiffView :diff-file="diffFile" :diff-view-mode="DiffModeEnum.Split" :diff-view-highlight="true" />
</template>`,
        }}
        theme={colorScheme === "dark" ? "dark" : "light"}
      >
        {/* @ts-ignore */}
        <SandpackLayout style={{ ["--sp-layout-height"]: "450px" }}>
          <SandpackFileExplorer />
          <SandpackCodeEditor />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </Card>
  );
};
