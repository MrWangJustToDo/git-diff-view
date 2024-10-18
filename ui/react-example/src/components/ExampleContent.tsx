import { Box, LoadingOverlay, useMantineColorScheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const link = "https://mrwangjusttodo.github.io/MrWangJustToDo.io/compare";
// const link = 'http://localhost:3000/compare';

const origin = "https://mrwangjusttodo.github.io";
// const origin = 'http://localhost:3000';

export const ExampleContent = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);

  const { colorScheme } = useMantineColorScheme();

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    window.addEventListener(
      "message",
      (e) => {
        if (e.origin === origin && typeof e.data === "object") {
          if (e.data.message === "hello") {
            setLoading(false);
          }
          if (e.data.message === "update") {
            setUpdating(false);
          }
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loading) {
      setUpdating(true);
      setTimeout(() => {
        ref.current?.contentWindow?.postMessage({ from: "container", color: colorScheme }, origin);
      }, 1000);
    }
  }, [loading, colorScheme]);

  return (
    <Box className={className} pos="relative">
      <LoadingOverlay visible={loading || updating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <iframe ref={ref} src={link} className="h-full w-full" />
    </Box>
  );
};
