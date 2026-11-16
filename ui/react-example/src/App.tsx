import {
  AppShell,
  Group,
  Button,
  Flex,
  Burger,
  Space,
  useMantineColorScheme,
  Anchor,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { IconBrandGithub, IconGitCompare, IconMoon, IconSun } from "@tabler/icons-react";
import { version } from "react";

import { DevTool } from "./components/DevTool";
import { Github } from "./components/icons";
import { usePreviewTypeWithRouter } from "./hooks/usePreviewType";
import { Example } from "./views/Example";
import { Main } from "./views/Main";
import { MultiSelectView } from "./views/MultiSelect";
import { PlayGroundFileDiff } from "./views/PlayGround/PlayGroundFileDiff";
import { PlayGroundGitDiff } from "./views/PlayGround/PlayGroundGitDiff";
import { WorkerExample } from "./views/Worker";

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { width } = useViewportSize();

  const type = usePreviewTypeWithRouter();

  const [opened, { toggle, close }] = useDisclosure();

  const goto = (type: "main" | "example" | "git-playground" | "file-playground" | "worker" | "multiselect") => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", type);
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const navItems = [
    { key: "main" as const, label: "Main" },
    { key: "git-playground" as const, label: "Git Playground" },
    { key: "file-playground" as const, label: "File Playground" },
    { key: "worker" as const, label: "Worker" },
    { key: "multiselect" as const, label: "MultiSelect" },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { desktop: true, mobile: !opened } }}
      // The landing page paints its own full-bleed background: any shell padding shows the body
      // colour as a frame around it. Other views keep the normal gutter.
      padding={type === "main" ? 0 : "md"}
    >
      <AppShell.Header
        className="glass z-50 border-b border-solid transition-colors"
        style={{
          borderColor: "var(--line-soft)",
          backgroundColor: colorScheme === "light" ? "rgba(255,255,255,0.85)" : "rgba(13,13,15,0.85)",
        }}
      >
        <Group h="100%" px="lg" justify="space-between" align="center">
          <Flex align="center" gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" className="mr-2" />
            <Flex align="center" gap={8} className="cursor-pointer select-none" onClick={() => goto("main")}>
              <IconGitCompare size={16} className="text-[var(--accent)]" />
              <span className="text-[13px] font-semibold tracking-tight text-[var(--ink)]">git-diff-view</span>
            </Flex>
            {width > 1000 && (
              <Tooltip label={<span>Go to @my-react project, version: {version}</span>} withArrow position="top">
                <Anchor href="https://github.com/MrWangJustToDo/MyReact" target="_blank" underline="never">
                  <span className="font-mono text-[11px] text-[var(--ink-faint)]">@my-react</span>
                </Anchor>
              </Tooltip>
            )}
          </Flex>

          <Flex align="center" gap={2} visibleFrom="sm">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goto(item.key)}
                className={`rounded-md px-2.5 py-1 text-[12.5px] transition-colors ${
                  type === item.key
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
              className="ml-1"
            >
              <IconBrandGithub size={15} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={toggleColorScheme}>
              {colorScheme === "light" ? <IconSun size={15} /> : <IconMoon size={15} />}
            </ActionIcon>
          </Flex>
          <Button variant="subtle" color="gray" hiddenFrom="sm" onClick={toggleColorScheme} size="compact-sm">
            {colorScheme === "light" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar py="md" px={4}>
        {navItems.map((item, i) => (
          <div key={item.key}>
            {i > 0 && <Space h="10" />}
            <Button
              variant={type === item.key ? "outline" : "subtle"}
              color={type === item.key ? "blue" : "gray"}
              fullWidth
              onClick={() => {
                close();
                goto(item.key);
              }}
            >
              {item.label}
            </Button>
          </div>
        ))}
        <Space h="10" />
        <Button
          variant="subtle"
          color="gray"
          component="a"
          href="https://github.com/MrWangJustToDo/git-diff-view"
          target="_blank"
          fullWidth
        >
          <Github className="!w-[1.45em] text-gray-400" />
        </Button>
      </AppShell.Navbar>
      <AppShell.Main>
        {type === "main" && <Main />}
        {type === "example" && (
          <Example className="border-color h-[calc(100vh-56px-32px)] w-full overflow-hidden rounded-md border" />
        )}
        {type === "git-playground" && <PlayGroundGitDiff />}
        {type === "file-playground" && <PlayGroundFileDiff />}
        {type === "worker" && <WorkerExample />}
        {type === "multiselect" && <MultiSelectView />}
        <DevTool />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
