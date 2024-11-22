import { Container, Space, Title } from "@mantine/core";

import { ReactPlayGround } from "./ReactPlayGround";
import { VuePlayGround } from "./VuePlayGround";

export const StartContent = () => {
  return (
    <Container className="mt-8" size="xl">
      <Title order={2}>Get Start (todo)</Title>
      <Space h="md" />
      <ReactPlayGround />
      <Space h="md" />
      <VuePlayGround />
    </Container>
  );
};
