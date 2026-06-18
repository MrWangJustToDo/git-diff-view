import { Container, Space, Title, Text, Box, Badge, Stack } from "@mantine/core";

import { ReactPlayGround, VuePlayGround, CliPlayGround } from "../../components/PlayGround";

export const StartContent = () => {
  return (
    <Container className="mb-12 mt-16" size="xl">
      <Box className="mb-10 text-center">
        <Badge size="lg" variant="light" color="blue" mb="md">
          Quick Start
        </Badge>
        <Title order={2} className="mb-4 text-3xl font-bold">
          Get Started in Seconds
        </Title>
        <Text size="lg" c="dimmed" className="mx-auto max-w-2xl">
          Install the package and start using Git Diff View in your project right away
        </Text>
      </Box>

      <Stack gap="xl">
        <ReactPlayGround />
        <VuePlayGround />
        <CliPlayGround />
      </Stack>

      <Space h="xl" />
    </Container>
  );
};
