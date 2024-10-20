import { AppShell, Group, Title, Button, Flex, Burger, Space, useMantineColorScheme, em } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";

import { ExampleContent } from "./components/ExampleContent";
import { Github } from "./components/icons";
import { MainContent } from "./components/MainContent";
import { PlayGround } from "./components/PlayGroundContent";
import { StartContent } from "./components/StartContent";
import { usePreviewTypeWithRouter } from "./hooks/usePreviewType";

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const type = usePreviewTypeWithRouter();

  const [opened, { toggle, close }] = useDisclosure();

  const goto = (type: "main" | "example" | "try") => {
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
            <Button
              variant="default"
              color="gray"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
            >
              <Github className="!w-[1.42em] text-gray-400" />
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
        {type === "main" && (
          <>
            <MainContent />
            <StartContent />
          </>
        )}
        {type === "example" && (
          <ExampleContent className="border-color h-[calc(100vh-60px-32px)] w-full overflow-hidden rounded-md border" />
        )}
        {type === "try" && <PlayGround />}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
