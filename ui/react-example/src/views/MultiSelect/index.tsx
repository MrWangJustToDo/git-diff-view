import { generateDiffFile } from "@git-diff-view/file";
import {
  Box,
  Container,
  Title,
  Text,
  Code,
  Space,
  useMantineColorScheme,
  Card,
  Accordion,
  Group,
  Badge,
} from "@mantine/core";
import { IconMessageCircle, IconSelect, IconCode } from "@tabler/icons-react";
import { useMemo } from "react";

import { DiffViewWithMultiSelect } from "../../components/DiffViewWithMultiSelect";
import { temp1, temp2 } from "../../components/MainContent/MainContentDiffExampleData";

const _diffFile = generateDiffFile("temp1.tsx", temp1, "temp2.tsx", temp2, "tsx", "tsx");

const usageCode = `import { DiffViewWithMultiSelect, SplitSide } from "@git-diff-view/react";
import { useRef, useState, useCallback } from "react";

function MyDiffView({ diffFile }) {
  const diffViewRef = useRef(null);
  const [comments, setComments] = useState({ oldFile: {}, newFile: {} });

  const handleAddWidgetClick = useCallback(({ lineNumber, fromLineNumber, side }) => {
    // lineNumber: end line of selection
    // fromLineNumber: start line of selection (same as lineNumber for single line)
    // side: SplitSide.old or SplitSide.new
    console.log("Add comment:", { lineNumber, fromLineNumber, side });
    // Open your comment input widget here
  }, []);

  const renderWidgetLine = useCallback(({ lineNumber, side, onClose }) => {
    // Render inline comment input form
    return (
      <div>
        <textarea placeholder="Add a comment..." />
        <button onClick={onClose}>Cancel</button>
        <button>Submit</button>
      </div>
    );
  }, []);

  const renderExtendLine = useCallback(({ data, lineNumber, fromLineNumber, side }) => {
    // Render saved comments
    // fromLineNumber is the start of multi-line selection
    return (
      <div>
        {fromLineNumber !== lineNumber && <span>Lines {fromLineNumber}-{lineNumber}</span>}
        {data.map((comment, i) => <div key={i}>{comment}</div>)}
      </div>
    );
  }, []);

  return (
    <DiffViewWithMultiSelect
      ref={diffViewRef}
      diffFile={diffFile}
      enableMultiSelect={true}
      diffViewAddWidget={true}
      extendData={comments}
      onAddWidgetClick={handleAddWidgetClick}
      renderWidgetLine={renderWidgetLine}
      renderExtendLine={renderExtendLine}
    />
  );
}`;

export const MultiSelectView = () => {
  const { colorScheme } = useMantineColorScheme();

  const diffFile = useMemo(() => {
    const instance = _diffFile;
    instance.initRaw();
    instance.buildSplitDiffLines();
    instance.buildUnifiedDiffLines();
    return instance;
  }, []);

  return (
    <Box className="min-h-screen">
      <Container size="xl" py="xl">
        {/* Header */}
        <Box className="mb-8 text-center">
          <Group justify="center" gap="xs" mb="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "orange", to: "yellow", deg: 90 }}
              leftSection={<IconSelect size={16} />}
            >
              New Feature
            </Badge>
          </Group>

          <Title
            order={1}
            className="mb-4 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-orange-400 dark:to-yellow-400"
          >
            Multi-Line Selection
          </Title>

          <Text size="lg" c="dimmed" className="mx-auto max-w-2xl">
            Select multiple lines by dragging on line numbers to add comments, just like GitHub PR reviews. Perfect for
            code review workflows.
          </Text>
        </Box>

        <Space h="xl" />

        {/* How to use */}
        <Accordion variant="separated" mb="xl">
          <Accordion.Item value="usage">
            <Accordion.Control icon={<IconCode size={20} />}>
              <Text fw={500}>How to Use</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Card withBorder>
                <Code block className="text-sm">
                  {usageCode}
                </Code>
              </Card>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="features">
            <Accordion.Control icon={<IconMessageCircle size={20} />}>
              <Text fw={500}>Features</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Box component="ul" className="list-disc pl-6">
                <li>
                  <Text>
                    <strong>Built-in component:</strong> Use <Code>DiffViewWithMultiSelect</Code> for easy integration
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Multi-line selection:</strong> Click and drag on line numbers to select a range
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Visual feedback:</strong> Selected lines are highlighted with a yellow overlay
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Inline widget:</strong> AddWidget button appears on selected lines for adding comments
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>fromLine support:</strong> ExtendData supports <Code>fromLine</Code> for multi-line comment
                    ranges
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Split & Unified mode:</strong> Works with both diff view modes
                  </Text>
                </li>
                <li>
                  <Text>
                    <strong>Low-level hook:</strong> Use <Code>useMultiSelect</Code> hook for custom implementations
                  </Text>
                </li>
              </Box>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* Live Demo */}
        <Box
          className="overflow-hidden rounded-xl border-2 border-solid"
          style={{
            borderColor: colorScheme === "light" ? "var(--mantine-color-gray-2)" : "var(--mantine-color-dark-4)",
            backgroundColor: colorScheme === "light" ? "white" : "var(--mantine-color-dark-7)",
          }}
          p="md"
        >
          <Group mb="md">
            <IconSelect size={20} />
            <Title order={4}>Live Demo</Title>
            <Badge variant="light" color="blue">
              Try it!
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" mb="md">
            Click and drag on the line numbers (left column) to select multiple lines, then add a comment.
          </Text>

          <Box
            className="h-[600px] overflow-auto rounded-lg border border-solid"
            style={{
              borderColor: colorScheme === "light" ? "#e9ecef" : "var(--mantine-color-dark-5)",
            }}
          >
            <DiffViewWithMultiSelect diffFile={diffFile} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
