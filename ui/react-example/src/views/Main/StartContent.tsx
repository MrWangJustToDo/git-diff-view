import { Container, Space, Title, Text, Box, Badge, Tabs, rem, useMantineColorScheme } from "@mantine/core";
import { IconBrandReact, IconBrandVue, IconCode } from "@tabler/icons-react";

import { ReactPlayGround, VuePlayGround } from "../../components/PlayGround";

export const StartContent = () => {
  const iconStyle = { width: rem(16), height: rem(16) };
  const { colorScheme } = useMantineColorScheme();

  return (
    <Container className="mt-16 mb-12" size="xl">
      {/* Section Header */}
      <Box className="text-center mb-12">
        <Badge size="lg" variant="light" color="blue" mb="md">
          Quick Start
        </Badge>
        <Title order={2} className="text-3xl font-bold mb-4">
          Get Started in Seconds
        </Title>
        <Text size="lg" c="dimmed" className="max-w-2xl mx-auto">
          Install the package and start using Git Diff View in your project right away
        </Text>
      </Box>

      {/* Tabs for Framework Examples */}
      <Box
        className="rounded-xl border border-solid shadow-sm"
        style={{
          borderColor: colorScheme === 'light' ? '#e9ecef' : 'var(--mantine-color-dark-4)',
          backgroundColor: colorScheme === 'light' ? '#ffffff' : 'var(--mantine-color-dark-7)',
        }}
      >
        <Box className="p-6">
          <Tabs defaultValue="react" variant="pills">
            <Tabs.List className="mb-6">
              <Tabs.Tab
                value="react"
                leftSection={<IconBrandReact style={iconStyle} />}
                className="text-base"
              >
                React
              </Tabs.Tab>
              <Tabs.Tab
                value="vue"
                leftSection={<IconBrandVue style={iconStyle} />}
                className="text-base"
              >
                Vue
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="react">
              <Box
                className="rounded-xl border border-solid p-6"
                style={{
                  borderColor: colorScheme === 'light' ? '#f1f3f5' : 'var(--mantine-color-dark-5)',
                  backgroundColor: colorScheme === 'light' ? '#f8f9fa' : 'var(--mantine-color-dark-6)',
                }}
              >
                <Box className="flex items-center gap-3 mb-4">
                  <IconCode size={24} className="text-blue-500" />
                  <Title order={3} size="h4">
                    React Example
                  </Title>
                </Box>
                <Text c="dimmed" mb="lg" className="text-base">
                  Simple and intuitive API for React applications. Supports SSR and RSC out of the box.
                </Text>
                <ReactPlayGround />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="vue">
              <Box
                className="rounded-xl border border-solid p-6"
                style={{
                  borderColor: colorScheme === 'light' ? '#f1f3f5' : 'var(--mantine-color-dark-5)',
                  backgroundColor: colorScheme === 'light' ? '#f8f9fa' : 'var(--mantine-color-dark-6)',
                }}
              >
                <Box className="flex items-center gap-3 mb-4">
                  <IconCode size={24} className="text-green-500" />
                  <Title order={3} size="h4">
                    Vue Example
                  </Title>
                </Box>
                <Text c="dimmed" mb="lg" className="text-base">
                  Seamless integration with Vue 3 Composition API. Reactive and performant.
                </Text>
                <VuePlayGround />
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>

      <Space h="xl" />
    </Container>
  );
};
