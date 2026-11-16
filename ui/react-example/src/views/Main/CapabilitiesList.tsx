import { capabilities, demoCards, goto } from "./mainContentData";

/**
 * Supporting sections: what the component does (a card grid with the API name printed on each
 * card) and where to try it.
 */
export const CapabilitiesSection = () => (
  <section className="lp-band border-y border-solid border-[var(--line-soft)]">
    <div className="md:py-18 mx-auto w-full max-w-[1120px] px-6 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="lp-eyebrow">Capabilities</p>
          <h2 className="lp-title mt-2 text-[1.7rem]">Everything a diff view needs</h2>
        </div>
        <p className="lp-lead max-w-[44ch] text-[13.5px]">
          Every item below is a prop or an export — nothing is styled by the wrapper packages.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap) => {
          const Icon = cap.icon;

          return (
            <div key={cap.id} className="lp-card lp-card-hover flex flex-col p-4">
              <span className="lp-tile">
                <Icon size={15} />
              </span>

              <h3 className="mt-3 text-[13.5px] font-semibold text-[var(--ink)]">{cap.label}</h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--ink-soft)]">{cap.description}</p>
              <code className="mt-3 block truncate rounded border border-solid border-[var(--line-soft)] bg-[var(--canvas-soft)] px-2 py-1 font-mono text-[11px] text-[var(--ink-faint)]">
                {cap.api}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const ExploreSection = () => (
  <section className="lp-page">
    <div className="md:py-18 mx-auto w-full max-w-[1120px] px-6 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="lp-eyebrow">Try it</p>
          <h2 className="lp-title mt-2 text-[1.7rem]">Three ways in</h2>
        </div>
        <p className="lp-lead max-w-[44ch] text-[13.5px]">Runs in the browser — no install needed.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {demoCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => goto(card.key)}
              className="lp-card lp-card-hover group flex flex-col items-start gap-3 p-4 text-left"
            >
              <span className="lp-tile">
                <Icon size={15} />
              </span>
              <span className="text-[13.5px] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                {card.title}
              </span>
              <span className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{card.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);
