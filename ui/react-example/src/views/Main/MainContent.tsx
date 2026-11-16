import { useState } from "react";

import { CapabilitiesSection, ExploreSection } from "./CapabilitiesList";
import { DemoSection } from "./DemoSection";
import { Hero } from "./Hero";
import { QuickStartSection } from "./QuickStartSection";
import { StatBand } from "./RepoStats";

import type { DiffFile } from "@git-diff-view/react";

/**
 * Landing page: hero with a code sample, a band of hard numbers, the live demo immediately after
 * (it is the best argument the library has), then capabilities, entry points and quick start.
 */
export const MainContent = () => {
  const [diffFile, setDiffFile] = useState<DiffFile>();

  return (
    <div className="lp-page lp-page-wrap min-h-screen">
      <Hero />
      <StatBand />
      <DemoSection diffFile={diffFile} onUpdate={setDiffFile} />
      <CapabilitiesSection />
      <ExploreSection />
      <QuickStartSection />

      <footer className="lp-page border-t border-solid border-[var(--line-soft)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-6 py-6 md:px-8">
          <span className="text-[12px] text-[var(--ink-faint)]">git-diff-view · MIT</span>
          <span className="text-[12px] text-[var(--ink-faint)]">Built with @my-react · React, Vue, Solid, Svelte</span>
        </div>
      </footer>
    </div>
  );
};
