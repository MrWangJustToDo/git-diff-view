import { Container, Stack } from "@mantine/core";

import { ReactPlayGround, VuePlayGround, CliPlayGround } from "../../components/PlayGround";

import { SectionHeading } from "./SectionHeading";

export const StartContent = () => (
  <Container size="xl" className="mb-20 mt-20 md:mt-24">
    <SectionHeading
      align="center"
      eyebrow="Quick start"
      title="Get started in seconds"
      description="Install the package and start using Git Diff View in your project right away."
    />

    <Stack gap="xl">
      <ReactPlayGround />
      <VuePlayGround />
      {/* The CliPlayGround relies on @my-react internals, so it only runs on the @my-react runtime. */}
      {__MY_REACT__ && <CliPlayGround />}
    </Stack>
  </Container>
);
