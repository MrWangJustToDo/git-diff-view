import {
  Box,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  Container,
  Badge,
  Group,
  Grid,
  SimpleGrid,
  UnstyledButton,
  Button,
  CopyButton,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconBrandReact,
  IconBrandSolidjs,
  IconBrandSvelte,
  IconBrandVue,
  IconBrandGithub,
  IconTerminal2,
  IconGitCompare,
  IconFileDiff,
  IconCpu,
  IconSelect,
  IconExternalLink,
  IconArrowRight,
  IconCopy,
  IconCheck,
  IconColumns,
  IconHighlight,
  IconTextWrap,
  IconBraces,
  IconStar,
  IconDownload,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";

import { MainContentDiffAdvance, MainContentDiffConfig, MainContentDiffExample } from "../../components/MainContent";

import type { DiffFile } from "@git-diff-view/react";

interface StatsData {
  stars: number;
  downloads: number;
  loading: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const goto = (type: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("type", type);
  window.history.pushState({}, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const installCmd = "npm install @git-diff-view/react";

const frameworkPills = [
  { icon: IconBrandReact, label: "React", color: "#61dafb" },
  { icon: IconBrandVue, label: "Vue", color: "#42b883" },
  { icon: IconBrandSolidjs, label: "Solid", color: "#5176b7" },
  { icon: IconBrandSvelte, label: "Svelte", color: "#eb5027" },
  { icon: IconTerminal2, label: "Ink (Terminal)", color: "#22c55e" },
];

const capabilities = [
  { icon: IconColumns, label: "Split & Unified", description: "Both diff view modes with full feature parity" },
  { icon: IconHighlight, label: "Syntax Highlighting", description: "Shiki or Lowlight powered, theme-aware" },
  { icon: IconTextWrap, label: "Line Wrap", description: "Long lines wrap gracefully with proper alignment" },
  { icon: IconBraces, label: "Extensible API", description: "Widgets, extend lines, custom renderers and more" },
];

const demoCards = [
  {
    key: "example",
    icon: IconExternalLink,
    color: "violet",
    title: "Live Example",
    description: "Real-world usage with an external application.",
  },
  {
    key: "git-playground",
    icon: IconGitCompare,
    color: "blue",
    title: "Git Playground",
    description: "Paste git diff output and preview instantly.",
  },
  {
    key: "file-playground",
    icon: IconFileDiff,
    color: "teal",
    title: "File Playground",
    description: "Compare two files side by side.",
  },
  {
    key: "worker",
    icon: IconCpu,
    color: "orange",
    title: "Worker",
    description: "Off-thread parsing for large diffs.",
  },
  {
    key: "multiselect",
    icon: IconSelect,
    color: "yellow",
    title: "Multi-Select",
    description: "Drag to select lines for comments.",
  },
];

export const MainContent = () => {
  const [d, setD] = useState<DiffFile>();
  const [stats, setStats] = useState<StatsData>({ stars: 0, downloads: 0, loading: true });

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [githubRes, npmRes] = await Promise.all([
          fetch("https://api.github.com/repos/MrWangJustToDo/git-diff-view"),
          fetch("https://api.npmjs.org/downloads/point/last-month/@git-diff-view/core"),
        ]);
        const [githubData, npmData] = await Promise.all([githubRes.json(), npmRes.json()]);
        setStats({
          stars: githubData.stargazers_count || 0,
          downloads: npmData.downloads || 0,
          loading: false,
        });
      } catch {
        setStats({ stars: 0, downloads: 0, loading: false });
      }
    };
    fetchStats();
  }, []);

  return (
    <Box className="min-h-screen">
      <Container size="xl">
        {/* ── Hero: compact centered ── */}
        <Box className="py-10 text-center md:py-14">
          <Title order={1} className="mx-auto mb-4 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            A{" "}
            <Text
              span
              inherit
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
            >
              Diff View
            </Text>{" "}
            component library
          </Title>

          <Text size="lg" c="dimmed" className="mx-auto mb-5 max-w-xl leading-relaxed">
            High-performance, GitHub-style diff viewer with split & unified modes, syntax highlighting, and
            multi-framework support.
          </Text>

          {/* Framework pills */}
          <Group gap={6} justify="center" className="mb-5">
            {frameworkPills.map((fw) => {
              const Icon = fw.icon;
              return (
                <Badge
                  key={fw.label}
                  size="md"
                  variant="light"
                  color="gray"
                  leftSection={<Icon size={14} color={fw.color} />}
                >
                  {fw.label}
                </Badge>
              );
            })}
          </Group>

          {/* Install command */}
          <Group justify="center" className="mb-5">
            <Box
              className="inline-flex items-center gap-2 rounded-lg border border-solid px-4 py-2 font-mono text-sm"
              style={{
                borderColor: colorScheme === "light" ? "#dee2e6" : "var(--mantine-color-dark-4)",
                backgroundColor: colorScheme === "light" ? "#f8f9fa" : "var(--mantine-color-dark-6)",
              }}
            >
              <Text span c="dimmed" className="select-none">
                $
              </Text>
              <Text span className="font-mono">
                {installCmd}
              </Text>
              <CopyButton value={installCmd} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
                    <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} size="sm" onClick={copy}>
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Box>
          </Group>

          {/* CTAs + stats */}
          <Group justify="center" gap="sm">
            <Button size="md" onClick={() => goto("git-playground")}>
              Try Playground
            </Button>
            <Button
              size="md"
              variant="default"
              component="a"
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
              leftSection={<IconBrandGithub size={18} />}
            >
              GitHub
            </Button>
            {!stats.loading && (
              <>
                <Badge size="lg" variant="light" color="yellow">
                  <Group gap={4}>
                    <IconStar size={12} fill="currentColor" />
                    {formatNumber(stats.stars)}
                  </Group>
                </Badge>
                <Badge size="lg" variant="light" color="blue" className="hidden sm:inline-flex">
                  <Group gap={4}>
                    <IconDownload size={14} />
                    {formatNumber(stats.downloads)}/mo
                  </Group>
                </Badge>
              </>
            )}
          </Group>
        </Box>

        {/* ── Capabilities strip ── */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" className="mb-10">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Box
                key={cap.label}
                className="rounded-lg border border-solid p-4 text-center"
                style={{
                  borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
                }}
              >
                <Icon
                  size={24}
                  className="mx-auto mb-2"
                  color={colorScheme === "light" ? "var(--mantine-color-blue-6)" : "var(--mantine-color-blue-4)"}
                />
                <Text fw={600} size="sm" className="mb-0.5">
                  {cap.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {cap.description}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* ── Interactive Demo: Config + Diff preview ── */}
        <Grid gutter="xl" className="mb-12">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
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

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box
              className="sticky top-4 h-[calc(100vh-120px)] transform-gpu overflow-hidden rounded-xl border-2 border-solid transition-all"
              style={{
                borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
                backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
              }}
            >
              {colorScheme === "dark" && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
              )}
              <MainContentDiffExample onUpdate={setD} />
            </Box>
          </Grid.Col>
        </Grid>

        {/* ── Explore More ── */}
        <Box className="mb-12">
          <Title order={2} className="mb-6 text-2xl font-bold">
            Explore More
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
            {demoCards.map((card) => {
              const Icon = card.icon;
              return (
                <UnstyledButton
                  key={card.key}
                  onClick={() => goto(card.key)}
                  className="group rounded-xl border border-solid p-4 transition-all hover:shadow-md"
                  style={{
                    borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-4)",
                    backgroundColor: colorScheme === "light" ? "#ffffff" : "var(--mantine-color-dark-6)",
                  }}
                >
                  <Group gap="sm" mb="xs">
                    <Icon size={18} color={`var(--mantine-color-${card.color}-6)`} />
                    <Text fw={600} size="sm">
                      {card.title}
                    </Text>
                    <IconArrowRight size={14} className="ml-auto opacity-0 transition-opacity group-hover:opacity-60" />
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {card.description}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};
