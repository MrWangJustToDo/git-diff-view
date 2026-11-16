import { MainContentDiffAdvance, MainContentDiffConfig, MainContentDiffExample } from "../../components/MainContent";

import type { DiffFile } from "@git-diff-view/react";

/**
 * The live demo sits directly under the hero: it is the most convincing thing on the page, so it
 * gets a full-width surface with the options on a single toolbar row above the diff.
 */
export const DemoSection = ({
  diffFile,
  onUpdate,
}: {
  diffFile?: DiffFile;
  onUpdate: (diffFile: DiffFile) => void;
}) => (
  <section className="lp-page">
    <div className="mx-auto w-full max-w-[1120px] px-6 py-12 md:px-8 md:py-16">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="lp-eyebrow">Live demo</p>
          <h2 className="lp-title mt-2 text-[1.6rem]">The real component, running here</h2>
        </div>
        <p className="lp-lead max-w-[42ch] text-[13.5px]">
          Every toggle below is a prop — no screenshots, no re-implementation.
        </p>
      </div>

      <div className="lp-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-solid border-[var(--line-soft)] px-4 py-2.5">
          <span className="font-mono text-[11.5px] text-[var(--ink-faint)]">temp1.tsx → temp2.tsx</span>

          <span className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-[var(--accent)]">+{diffFile?.additionLength || 0}</span>
            <span className="text-[#c0392b]">−{diffFile?.deletionLength || 0}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_196px]">
          <div className="relative h-[62vh] min-h-[360px] border-b border-solid border-[var(--line-soft)] lg:border-b-0 lg:border-r">
            <MainContentDiffExample onUpdate={onUpdate} />
          </div>

          <aside className="flex flex-col gap-5 px-4 py-4">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                options
              </div>
              <MainContentDiffConfig diffFile={diffFile} />
            </div>

            <div className="border-t border-solid border-[var(--line-soft)] pt-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                advanced
              </div>
              <MainContentDiffAdvance />
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>
);
