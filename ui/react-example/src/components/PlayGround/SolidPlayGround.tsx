/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Box, Card, useMantineColorScheme } from "@mantine/core";
import { IconBrandSolidjs } from "@tabler/icons-react";

// import { Vue } from "./icons";
import { f1, f2 } from "./ReactPlayGround";

// not work
export const SolidPlayGround = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card className="p-0" withBorder>
      <Box className="flex items-center px-2 py-2 font-sans text-[14px]">
        <IconBrandSolidjs size="16" color="#42b883" className="mr-2" />
        Solid
      </Box>
      <SandpackProvider
        // no vite template
        template="solid"
        customSetup={{
          dependencies: {
            "@git-diff-view/file": "0.0.30",
            "@git-diff-view/solid": "0.0.3",
          },
        }}
        files={{
          "/App.tsx": `
  import { DiffModeEnum, DiffView, DiffViewProps, SplitSide, DiffFile } from "@git-diff-view/solid";
  import { generateDiffFile } from "@git-diff-view/file";
  import "@git-diff-view/solid/styles/diff-view.css";

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

const App = () => {
  const diffFile: DiffFile = getDiffFile();

  return <DiffView diffFile={diffFile} diffViewMode={DiffModeEnum.Split} diffViewHighlight={true} />
}

export default App;
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
