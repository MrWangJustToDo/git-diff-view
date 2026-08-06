/**
 * Expand icons via Lynx `<svg content>`.
 * Match DOM: hunk action `color: var(--diff-plain-lineNumber-color--)` + `fill-current`.
 * Compact arcs like `A.25.25` are expanded — Lynx can mis-parse the shorthand.
 * SVG `content` cannot resolve CSS vars, so bake the same theme values.
 */

import { useDiffViewContext } from "./DiffViewContext";

type IconProps = { size?: number };

/** Keep in sync with `--diff-plain-lineNumber-color--` in theme.css / react `_com.css`. */
const PLAIN_LINE_NUMBER_COLOR = { light: "#555555", dark: "#a0aaab" } as const;

/** `A.25.25` / `a.75.75` → `A 0.25 0.25` / `a 0.75 0.75` */
const normalizePath = (d: string) => d.replace(/([Aa])\.(\d+)\.(\d+)/g, "$1 0.$2 0.$3");

const svgContent = (d: string, fill: string, size: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16"><path fill="${fill}" d="${normalizePath(d)}"/></svg>`;

const Icon = ({ size = 16, d }: IconProps & { d: string }) => {
  const { useDiffContext } = useDiffViewContext();
  const theme = useDiffContext.useShallowStableSelector((s) => (s.theme || "light") as "light" | "dark");
  const fill = PLAIN_LINE_NUMBER_COLOR[theme];

  return <svg content={svgContent(d, fill, size)} style={{ width: `${size}px`, height: `${size}px` }} />;
};

/* Exact paths from packages/react/src/components/DiffExpand.tsx */
const UP =
  "M7.823 1.677 4.927 4.573A.25.25 0 0 0 5.104 5H7.25v3.236a.75.75 0 1 0 1.5 0V5h2.146a.25.25 0 0 0 .177-.427L8.177 1.677a.25.25 0 0 0-.354 0ZM13.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm-3.75.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM7.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM4 11.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM1.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z";

const DOWN =
  "m8.177 14.323 2.896-2.896a.25.25 0 0 0-.177-.427H8.75V7.764a.75.75 0 1 0-1.5 0V11H5.104a.25.25 0 0 0-.177.427l2.896 2.896a.25.25 0 0 0 .354 0ZM2.25 5a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 4.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75ZM8.25 5a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 4.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z";

const ALL =
  "m8.177.677 2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25a.75.75 0 0 1-1.5 0V4H5.104a.25.25 0 0 1-.177-.427L7.823.677a.25.25 0 0 1 .354 0ZM7.25 10.75a.75.75 0 0 1 1.5 0V12h2.146a.25.25 0 0 1 .177.427l-2.896 2.896a.25.25 0 0 1-.354 0l-2.896-2.896A.25.25 0 0 1 5.104 12H7.25v-1.25Zm-5-2a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 6 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 12 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z";

export const ExpandUp = (props: IconProps) => <Icon {...props} d={UP} />;
export const ExpandDown = (props: IconProps) => <Icon {...props} d={DOWN} />;
export const ExpandAll = (props: IconProps) => <Icon {...props} d={ALL} />;
