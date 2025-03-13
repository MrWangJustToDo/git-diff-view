import { Button, ButtonGroup } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

const src = "https://mrwangjusttodo.github.io/myreact-devtools";

function loadScript(url: string) {
  const script = document.createElement("script");
  return new Promise((resolve, reject) => {
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  }).finally(() => script.remove());
}

const getFunc = () => (window as any).__MY_REACT_DEVTOOL_IFRAME__;

async function init() {
  if (typeof getFunc() === "function") {
    getFunc()(src);
  } else {
    await loadScript(`${src}/bundle/hook.js`);
    await init();
  }
}

export const DevTool = () => {
  const [hide, setHide] = useState(false);

  const [open, setOpen] = useState(false);

  return (
    <ButtonGroup className="fixed bottom-16 left-4 z-50" style={{ display: hide ? "none" : undefined }}>
      <Button
        color="red"
        size="md"
        onClick={async () => {
          if (!open) {
            await init();

            setOpen(true);
          } else {
            getFunc()?.["close"]?.();

            setOpen(false);
          }
        }}
      >
        {!open ? "Open" : "Close"} DevTool
      </Button>
      <Button size="md" className="px-2" variant="light" onClick={() => setHide(true)}>
        <IconX />
      </Button>
    </ButtonGroup>
  );
};
