import {
  IconBraces,
  IconColumns,
  IconCpu,
  IconExternalLink,
  IconFileDiff,
  IconGitCompare,
  IconHighlight,
  IconSelect,
  IconTextWrap,
} from "@tabler/icons-react";

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
  { icon: IconColumns, label: "Split & unified", description: "Both diff view modes with full feature parity" },
  { icon: IconHighlight, label: "Syntax highlighting", description: "Lowlight, Shiki or Lezer powered, theme-aware" },
  { icon: IconTextWrap, label: "Line wrap", description: "Long lines wrap gracefully with proper alignment" },
  { icon: IconBraces, label: "Extensible API", description: "Widgets, extend lines, custom renderers and more" },
];

export const demoCards = [
  {
    key: "example",
    icon: IconExternalLink,
    title: "Live example",
    description: "Real-world usage in an external application.",
  },
  {
    key: "git-playground",
    icon: IconGitCompare,
    title: "Git playground",
    description: "Paste git diff output and preview it instantly.",
  },
  {
    key: "file-playground",
    icon: IconFileDiff,
    title: "File playground",
    description: "Compare two files side by side.",
  },
  {
    key: "worker",
    icon: IconCpu,
    title: "Worker",
    description: "Off-thread parsing for large diffs.",
  },
  {
    key: "multiselect",
    icon: IconSelect,
    title: "Multi-select",
    description: "Drag to select lines for comments.",
  },
];
