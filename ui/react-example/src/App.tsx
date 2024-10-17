import { AppShell, Group, Title, Button, Flex, Burger, Space, useMantineColorScheme, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";

import { Github } from "./components/icons";
import { MainContent } from "./components/MainContent";

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const [opened, { toggle }] = useDisclosure();

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
            <Button variant="light" color="gray">
              Example
            </Button>
            <Button variant="light" color="gray">
              Playground
            </Button>
            <Button
              variant="default"
              color="gray"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
            >
              <Github className="w-[1.42em] text-gray-400" />
            </Button>
            <Button variant="light" className="text-sm" onClick={toggleColorScheme} color="blue">
              {colorScheme === "light" ? <IconSun /> : <IconMoon />}
            </Button>
          </Flex>
          <Button variant="light" className="text-sm" hiddenFrom="sm" onClick={toggleColorScheme} color="blue">
            {colorScheme === "light" ? <IconSun /> : <IconMoon />}
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar py="md" px={4}>
        <Button variant="light" color="gray">
          Example
        </Button>
        <Space h="14" />
        <Button variant="light" color="gray">
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
          <Github className="w-[1.45em] text-gray-400" />
        </Button>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="xl">
          <MainContent />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
