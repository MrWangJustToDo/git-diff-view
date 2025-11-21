import { version } from "@git-diff-view/react";
import {
  Box,
  Code,
  Divider,
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
  Badge,
  Group,
  Grid,
} from "@mantine/core";
import { IconBrandReact, IconBrandSolidjs, IconBrandSvelte, IconBrandVue, IconSparkles } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { MainContentDiffAdvance, MainContentDiffConfig, MainContentDiffExample } from "../../components/MainContent";

import type { DiffFile } from "@git-diff-view/react";

export const MainContent = () => {
  const theme = useMantineTheme();

  const [d, setD] = useState<DiffFile>();

  const { colorScheme } = useMantineColorScheme();

  const color = useMemo(() => alpha(getThemeColor("yellow", theme), 0.5), [theme]);

  return (
    <Box className="min-h-screen">
      <Container size="xl">
        {/* Hero Section */}
        <Box className="py-12 text-center">
          <Box className="relative inline-block">
            {colorScheme === "dark" && (
              <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
            )}
            <div className="relative">
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
                leftSection={<IconSparkles size={16} />}
                className="mb-4"
              >
                Open Source
              </Badge>

              <Title
                order={1}
                className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent md:text-6xl dark:from-blue-400 dark:to-purple-400"
              >
                Git Diff View
              </Title>

              <Text size="lg" c="dimmed" className="mb-2 font-mono">
                @git-diff-view/react · v{version}
              </Text>
            </div>
          </Box>

          <Space h="xl" />

          <Box className="mx-auto max-w-3xl">
            <Text size="xl" className="mb-4 leading-relaxed">
              A high-performance <Code className="text-lg font-semibold">Diff View</Code> component for
            </Text>

            <Group justify="center" gap="lg" className="mb-4">
              <Group gap="xs" className="inline-flex">
                <IconBrandReact className="animate-float" color="#75c3d9" size={24} />
                <Text span className="text-lg font-semibold">
                  React
                </Text>
              </Group>
              <Group gap="xs" className="inline-flex">
                <IconBrandVue className="animate-float" color="#42b883" size={24} style={{ animationDelay: "0.5s" }} />
                <Text span className="text-lg font-semibold">
                  Vue
                </Text>
              </Group>
              <Group gap="xs" className="inline-flex">
                <IconBrandSolidjs
                  className="animate-float"
                  color="#5176b7"
                  size={24}
                  style={{ animationDelay: "1s" }}
                />
                <Text span className="text-lg font-semibold">
                  Solid
                </Text>
              </Group>
              <Group gap="xs" className="inline-flex">
                <IconBrandSvelte
                  className="animate-float"
                  color="#eb5027"
                  size={24}
                  style={{ animationDelay: "1.5s" }}
                />
                <Text span className="text-lg font-semibold">
                  Svelte
                </Text>
              </Group>
            </Group>

            <Highlight highlight={["feature-rich", "GitHub-style"]} color={color} className="text-lg">
              Feature-rich diff viewer with GitHub-style UI, easy to integrate and highly customizable.
            </Highlight>
          </Box>
        </Box>

        <Divider my="xl" className="opacity-30" />

        {/* Main Content Area */}
        <Grid gutter="xl" className="mb-12">
          {/* Left Sidebar - Controls */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Diff Config Section */}
              <Box
                className="rounded-xl border border-solid p-5 shadow-sm"
                style={{
                  borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
                }}
              >
                <Group justify="apart" mb="md">
                  <Title order={4} className="text-lg">
                    Configuration
                  </Title>
                  <Box
                    className="inline-flex items-center gap-2 rounded-lg border border-solid px-3 py-1.5 shadow-sm"
                    style={{
                      borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
                      backgroundColor: colorScheme === "light" ? "#f8f9fa" : "var(--mantine-color-dark-7)",
                    }}
                  >
                    <Text className="font-mono text-sm font-semibold text-green-500">+{d?.additionLength || 0}</Text>
                    <div className="h-3.5 w-px bg-gray-300 dark:bg-gray-600" />
                    <Text className="font-mono text-sm font-semibold text-red-500">-{d?.deletionLength || 0}</Text>
                  </Box>
                </Group>
                <MainContentDiffConfig diffFile={d} />
              </Box>

              {/* Advanced Usage Section */}
              <Box
                className="rounded-xl border border-solid p-5 shadow-sm"
                style={{
                  borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
                }}
              >
                <Title order={4} mb="md" className="text-lg">
                  Advanced Options
                </Title>
                <MainContentDiffAdvance />
              </Box>
            </Stack>
          </Grid.Col>

          {/* Right Side - Diff Preview */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box
              className="sticky top-4 h-[calc(100vh-120px)] transform-gpu overflow-hidden rounded-xl border-2 border-solid shadow-2xl transition-all"
              style={{
                borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
                backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
              }}
            >
              {/* Decorative gradient overlay */}
              {colorScheme === "dark" && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
              )}

              <MainContentDiffExample onUpdate={setD} />
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};
