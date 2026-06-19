/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SandpackCodeEditor, SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react";
import { DiffView } from "@git-diff-view/cli";
import { Box, Card, useMantineColorScheme } from "@mantine/core";
import { InkTerminalBox } from "@my-react/react-terminal/web";
import { IconTerminal2 } from "@tabler/icons-react";
import { useMemo } from "react";

import { useDiffHighlighter } from "../../hooks/useDiffHighlighter";
import { getNewDiffFile } from "../MainContent";

export const CliPlayGround = () => {
  const { colorScheme } = useMantineColorScheme();

  const highlighter = useDiffHighlighter();

  const diffFile = useMemo(() => getNewDiffFile(), []);

  return (
    <Card className="p-0" withBorder>
      <Box className="flex items-center px-2 py-2 font-sans text-[14px]">
        <IconTerminal2 size="16" color="#22c55e" className="mr-2" /> Ink (Terminal)
      </Box>
      <SandpackProvider
        template="vite-react-ts"
        theme={colorScheme === "dark" ? "dark" : "light"}
        files={{
          "/App.tsx": `import { render } from "ink";
import { DiffView, DiffFile, DiffModeEnum } from "@git-diff-view/cli";

const diffString = \`--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,3 @@
 const greeting = "hello";
-console.log(greeting);
+console.log(\\\`\\\${greeting} world\\\`);
 export default greeting;
\`;

const diffFile = new DiffFile(
  "file.ts", "", "file.ts", "",
  [diffString], "ts", "ts"
);
diffFile.init();
diffFile.buildSplitDiffLines();
diffFile.buildUnifiedDiffLines();

render(
  <DiffView
    diffFile={diffFile}
    diffViewMode={DiffModeEnum.Split}
    diffViewHighlight={true}
    diffViewTheme="dark"
  />
);
`,
        }}
      >
        {/* @ts-ignore */}
        <SandpackLayout style={{ ["--sp-layout-height"]: "450px" }}>
          <SandpackCodeEditor showTabs />
          <Box className="flex flex-1 items-center justify-center overflow-hidden">
            <InkTerminalBox padding={0}>
              <DiffView
                diffFile={diffFile}
                registerHighlighter={highlighter}
                diffViewTheme="dark"
                diffViewHighlight
                diffViewHideOperator
              />
            </InkTerminalBox>
            {/* <img
              src="https://raw.githubusercontent.com/MrWangJustToDo/git-diff-view/main/cli-diff.png"
              alt="@git-diff-view/cli terminal rendering"
              className="block w-full object-cover object-top"
            /> */}
          </Box>
        </SandpackLayout>
      </SandpackProvider>
    </Card>
  );
};
