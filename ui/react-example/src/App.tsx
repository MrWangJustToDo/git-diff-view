import {
  AppShell,
  Group,
  Title,
  Button,
  Flex,
  Burger,
  Space,
  useMantineColorScheme,
  em,
  Anchor,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { IconBrandGithub, IconMoon, IconSun } from "@tabler/icons-react";
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
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between" align="center">
          {/* Left: logo */}
          <Flex align="center">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" className="mr-2" />
            <Title order={1} className="text-xl font-bold">
              Git Diff View
            </Title>
            {width > 1000 && (
              <>
                <small className="ml-4 mr-1">power by</small>
                <Tooltip label={<span>Go to @my-react project, version: {version}</span>} withArrow position="top">
                  <Anchor href="https://github.com/MrWangJustToDo/MyReact" target="_blank">
                    <small>@my-react</small>
                  </Anchor>
                </Tooltip>
              </>
            )}
          </Flex>

          {/* Right: nav + actions */}
          <Flex gap="8" align="center" visibleFrom="sm">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={type === item.key ? "outline" : "subtle"}
                color={type === item.key ? "blue" : "gray"}
                size="compact-sm"
                onClick={() => goto(item.key)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
            >
              <IconBrandGithub size={18} />
            </Button>
            <Button variant="subtle" size="compact-sm" onClick={toggleColorScheme} color="violet">
              {colorScheme === "light" ? (
                <IconSun style={{ width: em(18), height: em(18) }} />
              ) : (
                <IconMoon style={{ width: em(18), height: em(18) }} />
              )}
            </Button>
          </Flex>
          <Button variant="subtle" hiddenFrom="sm" onClick={toggleColorScheme} color="violet">
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
          <Example className="border-color h-[calc(100vh-60px-32px)] w-full overflow-hidden rounded-md border" />
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
