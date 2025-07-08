/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Box, Card, useMantineColorScheme } from "@mantine/core";
import { IconBrandReact } from "@tabler/icons-react";

export const f1 = `
export type DiffHighlighter = {
    name: string;
    maxLineToIgnoreSyntax: number;
    setMaxLineToIgnoreSyntax: (v: number) => void;
    ignoreSyntaxHighlightList: (string | RegExp)[];
    setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
    getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;
    processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
    hasRegisteredCurrentLang: (lang: string) => boolean;
    getHighlighterEngine: () => typeof lowlight;
  };`;

export const f2 = `export type DiffHighlighter = {
    name: string;
    maxLineToIgnoreSyntax: number;
    setMaxLineToIgnoreSyntax: (v: number) => void;
    ignoreSyntaxHighlightList: (string | RegExp)[];
    setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
    getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;
    processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
    hasRegisteredCurrentLang: (lang: string) => boolean;
    getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;
  };`;

export const ReactPlayGround = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card className="p-0" withBorder>
      <Box className="flex items-center px-2 py-2 font-sans text-[14px]">
        <IconBrandReact size="16" color="rgb(8,126,164)" className="mr-2" /> React
      </Box>
      <SandpackProvider
        template="vite-react-ts"
        customSetup={{
          dependencies: {
            "@git-diff-view/file": "0.0.30",
            "@git-diff-view/react": "0.0.30",
          },
        }}
        theme={colorScheme === "dark" ? "dark" : "light"}
        files={{
          "/App.tsx": `import { DiffView, DiffFile, DiffModeEnum } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";
import "@git-diff-view/react/styles/diff-view.css";
import { useMemo } from "react";

const temp1 = \`${f1}\`;
const temp2 = \`${f2}\`;

const App = () => {

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

  const diffFile = useMemo(() => getDiffFile(), [temp1, temp2]);

  return (
    <DiffView
      diffFile={diffFile}
      diffViewWrap={false}
      diffViewAddWidget
      renderWidgetLine={({ onClose }) => {
        return (
          <div style={{ display: 'flex', border: '1px solid', padding: '10px', justifyContent: 'space-between' }}>
            123
            <button style={{ border: '1px solid', borderRadius: '2px', padding: '4px 8px'  }} onClick={onClose}>
              close
            </button>
          </div>
        );
      }}
      diffViewTheme={"light"}
      diffViewHighlight={true}
      diffViewMode={DiffModeEnum.Split}
    />
  );
};

export default App;

    `,
        }}
      >
        {/* @ts-ignore */}
        <SandpackLayout style={{ ["--sp-layout-height"]: "450px" }}>
          <SandpackFileExplorer />
          <SandpackCodeEditor showTabs closableTabs />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </Card>
  );
};
