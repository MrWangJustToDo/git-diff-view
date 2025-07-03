import { buildCss, copyCss, preSvelte } from "./utils";

const buildSvelte = async () => {
  await preSvelte();
  await buildCss("svelte");
  await copyCss("svelte", "diff-view.css");
  await copyCss("svelte", "diff-view-pure.css");
};

buildSvelte();
