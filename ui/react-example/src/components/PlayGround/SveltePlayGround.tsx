/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Box, Card, useMantineColorScheme } from "@mantine/core";
import { IconBrandSvelte } from "@tabler/icons-react";

// import { Vue } from "./icons";
import { f1, f2 } from "./ReactPlayGround";

// SEE https://github.com/codesandbox/sandpack/issues/1250
// currently, the svelte 5 is not support by sandpack
export const SveltePlayGround = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card className="p-0" withBorder>
      <Box className="flex items-center px-2 py-2 font-sans text-[14px]">
        <IconBrandSvelte size="16" color="#42b883" className="mr-2" />
        Svelte
      </Box>
      <SandpackProvider
        template="vite-svelte-ts"
        customSetup={{
          dependencies: {
            "@git-diff-view/file": "0.0.30",
            "@git-diff-view/svelte": "0.0.3",
          },
        }}
        files={{
          "/src/App.svelte": `<script lang='ts'>
  import { DiffModeEnum, DiffView, DiffViewProps, SplitSide, DiffFile } from "@git-diff-view/svelte";
  import { generateDiffFile } from "@git-diff-view/file";
  import "@git-diff-view/svelte/styles/diff-view.css";

  const temp1 = \`${f1}\`;
  const temp2 = \`${f2}\`;

  const getDiffFile = () => {
    const instance = generateDiffFile(
      "oldFileName",
      temp1,
      "newFileName",
      temp2,
      "tsx",
      "tsx"
    );
    instance.initRaw();
    return instance;
  };

  const diffFile: DiffFile = $derived.by(() => getDiffFile());
</script>
<DiffView diffFile={diffFile} diffViewMode={DiffModeEnum.Split} diffViewHighlight={true} />
`,
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
