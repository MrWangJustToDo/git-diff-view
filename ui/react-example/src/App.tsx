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
import { PlayGround } from "./views/PlayGround";
import { WorkerExample } from "./views/Worker";

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { width } = useViewportSize();

  const type = usePreviewTypeWithRouter();

  const [opened, { toggle, close }] = useDisclosure();

  const goto = (type: "main" | "example" | "try" | "worker") => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", type);
    url.searchParams.delete("tab");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Flex align="center">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" className="mr-2" />
            <Title order={1} className="text-xl">
              Git Diff View
            </Title>
            {width > 900 && (
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
          <Flex columnGap="16" visibleFrom="sm">
            <Button variant="light" color={type === "main" ? "blue" : "gray"} onClick={() => goto("main")}>
              Main
            </Button>
            <Button variant="light" color={type === "example" ? "blue" : "gray"} onClick={() => goto("example")}>
              Example
            </Button>
            <Button variant="light" color={type === "try" ? "blue" : "gray"} onClick={() => goto("try")}>
              Playground
            </Button>
            <Button variant="light" color={type === "worker" ? "blue" : "gray"} onClick={() => goto("worker")}>
              Worker
            </Button>
            <Button
              variant="default"
              color="gray"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
            >
              <IconBrandGithub className="text-gray-400" />
            </Button>
            <Button variant="light" className="text-sm" onClick={toggleColorScheme} color="violet">
              {colorScheme === "light" ? (
                <IconSun style={{ width: em(20), height: em(20) }} />
              ) : (
                <IconMoon style={{ width: em(20), height: em(20) }} />
              )}
            </Button>
          </Flex>
          <Button variant="light" className="text-sm" hiddenFrom="sm" onClick={toggleColorScheme} color="violet">
            {colorScheme === "light" ? <IconSun /> : <IconMoon />}
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar py="md" px={4}>
        <Button
          variant="light"
          color={type === "main" ? "blue" : "gray"}
          onClick={() => {
            close();
            goto("main");
          }}
        >
          Main
        </Button>
        <Space h="14" />
        <Button
          variant="light"
          color={type === "example" ? "blue" : "gray"}
          onClick={() => {
            close();
            goto("example");
          }}
        >
          Example
        </Button>
        <Space h="14" />
        <Button
          variant="light"
          color={type === "try" ? "blue" : "gray"}
          onClick={() => {
            close();
            goto("try");
          }}
        >
          Playground
        </Button>
        <Space h="14" />
        <Button
          variant="light"
          color="gray"
          component="a"
          href="https://github.com/MrWangJustToDo/git-diff-view"
          target="_blank"
        >
          <Github className="!w-[1.45em] text-gray-400" />
        </Button>
      </AppShell.Navbar>
      <AppShell.Main>
        {type === "main" && <Main />}
        {type === "example" && (
          <Example className="border-color h-[calc(100vh-60px-32px)] w-full overflow-hidden rounded-md border" />
        )}
        {type === "try" && <PlayGround />}
        {type === "worker" && <WorkerExample />}
        <DevTool />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
