import { IconBraces, IconColumns, IconHighlight, IconTextWrap } from "@tabler/icons-react";

export const installCmd = "npm install @git-diff-view/react";

export const goto = (type: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("type", type);
  window.history.pushState({}, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const frameWorkNames = ["React", "Vue", "Solid", "Svelte", "Lynx", "Ink"];

export const capabilities = [
  {
    id: "split-unified",
    icon: IconColumns,
    label: "Split & unified",
    description: "Both diff modes with full feature parity — switch at runtime without re-parsing the file.",
    api: "diffViewMode",
  },
  {
    id: "syntax-highlight",
    icon: IconHighlight,
    label: "Syntax highlighting",
    description: "Lowlight, Shiki or Lezer, theme aware and swappable per project.",
    api: "diffViewHighlight",
  },
  {
    id: "line-wrap",
    icon: IconTextWrap,
    label: "Line wrap",
    description: "Long lines wrap with the gutter and indentation kept in alignment.",
    api: "diffViewWrap",
  },
  {
    id: "extensible-api",
    icon: IconBraces,
    label: "Extensible API",
    description: "Widgets, extend lines and custom renderers — only the parts you need to override.",
    api: "renderWidgetLine",
  },
];

export const demoCards = [
  {
    key: "git-playground",
    icon: IconColumns,
    title: "Git playground",
    description: "Paste git diff output and preview it instantly, then tune every option.",
  },
  {
    key: "file-playground",
    icon: IconTextWrap,
    title: "File playground",
    description: "Compare two file contents side by side without touching git.",
  },
  {
    key: "multiselect",
    icon: IconBraces,
    title: "Multi-select",
    description: "Drag across line numbers to select a range and leave a comment on it.",
  },
];
