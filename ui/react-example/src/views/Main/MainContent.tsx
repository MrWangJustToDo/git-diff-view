import { Box, Container, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";

import { MainContentDiffAdvance, MainContentDiffConfig, MainContentDiffExample } from "../../components/MainContent";

import { CapabilitiesGrid } from "./CapabilitiesGrid";
import { ExploreCards } from "./ExploreCards";
import { HeroSection } from "./HeroSection";
import { goto } from "./mainContentData";
import { SectionHeading } from "./SectionHeading";

import type { DiffFile } from "@git-diff-view/react";

const cardClass =
  "border border-solid border-gray-200 bg-white dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-6)]";

const cardTitleClass = "text-[13.5px] font-semibold text-gray-900 dark:text-white";

export const MainContent = () => {
  const [d, setD] = useState<DiffFile>();

  return (
    <Box className="min-h-screen">
      <HeroSection />

      <Container size="xl" className="pt-16 md:pt-20">
        <CapabilitiesGrid />

        <section className="mt-20 md:mt-24">
          <SectionHeading
            eyebrow="Live demo"
            title="Configure it your way"
            description="Toggle modes, highlighting, wrapping and more — the diff updates instantly."
          />

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Box className={`relative rounded-xl p-5 ${cardClass}`}>
                  <Group justify="apart" mb="md">
                    <Title order={4} className={cardTitleClass}>
                      Configuration
                    </Title>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-solid border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-7)]">
                      <Text className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{d?.additionLength || 0}
                      </Text>
                      <div className="h-3 w-px bg-gray-200 dark:bg-[var(--mantine-color-dark-4)]" />
                      <Text className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                        -{d?.deletionLength || 0}
                      </Text>
                    </div>
                  </Group>
                  <MainContentDiffConfig diffFile={d} />
                </Box>

                <Box className={`relative rounded-xl p-5 ${cardClass}`}>
                  <Title order={4} mb="md" className={cardTitleClass}>
                    Advanced options
                  </Title>
                  <MainContentDiffAdvance />
                </Box>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Box
                className={`relative h-[70vh] overflow-hidden rounded-xl md:sticky md:top-20 md:h-[calc(100vh-140px)] ${cardClass}`}
              >
                <MainContentDiffExample onUpdate={setD} />
              </Box>
            </Grid.Col>
          </Grid>
        </section>

        <section className="mt-20 md:mt-24">
          <ExploreCards onNavigate={goto} />
        </section>
      </Container>
    </Box>
  );
};
