import {
  Box,
  Code,
  Divider,
  Flex,
  Space,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  Highlight,
  useMantineTheme,
  alpha,
  getThemeColor,
  Container,
} from "@mantine/core";
import { useMemo, useState } from "react";

import { MainContentDiffConfig } from "./MainContentDiffConfig";
import { MainContentDiffExample } from "./MainContentDiffExample";

import type { DiffFile } from "@git-diff-view/react";

export const MainContent = () => {
  const theme = useMantineTheme();

  const [d, setD] = useState<DiffFile>();

  const { colorScheme } = useMantineColorScheme();

  const color = useMemo(() => alpha(getThemeColor("yellow", theme), 0.5), [theme]);

  return (
    <Container size="xl">
      <Flex mt="lg" direction={{ base: "column", sm: "row" }}>
        <Stack gap="2" className="flex-1" mb="20" ml={{ md: "2em", lg: "3em", xl: "4em" }} mr="lg">
          <Space h="40" />
          <Title>Git Diff View</Title>
          <Space h="12" />
          <Text size="lg" component="div">
            A <Code>Diff</Code> view component for React / Vue / Solid / Svelte,
            <Highlight highlight={["easy to use", "feature complete"]} color={color}>
              The most one component what easy to use and feature complete.
            </Highlight>
          </Text>
          <Space h="12" />
          <Divider />
          <Space h="12" />
          <Title order={4}>Diff View Config</Title>
          <Space h="4" />
          <MainContentDiffConfig diffFile={d} />
        </Stack>

        <Box
          className={`relative h-[calc(100vh-200px)] transform-gpu overflow-hidden rounded-md border border-solid ${colorScheme === "light" ? "border-gray-200" : "border-gray-600"}`}
          w={{ base: "100%", sm: "60%" }}
        >
          <MainContentDiffExample onUpdate={setD} />
        </Box>
      </Flex>
    </Container>
  );
};
