import { renderToStaticMarkup, renderToString } from "octane/server";
import { describe, expect, it } from "vitest";

import { DiffModeEnum, DiffView } from "../../src";
import { representativeDiff } from "../fixtures";

describe("@git-diff-view/octane SSR", () => {
  it("renders a deterministic server shell without a browser runtime", () => {
    const props = {
      data: representativeDiff,
      diffViewFontSize: 12,
      diffViewHighlight: false,
      diffViewMode: DiffModeEnum.Unified,
      diffViewTheme: "light" as const,
      diffViewWrap: true,
    };
    const first = renderToString(DiffView, props);
    const second = renderToStaticMarkup(DiffView, props);

    expect(first.html).toContain('data-component="git-diff-view"');
    expect(first.html).toContain('data-theme="light"');
    expect(first.html).toContain("unified-diff-view");
    expect(second.html).toContain("unified-diff-view");
    expect(first.html).not.toContain("reactroot");
  });
});
