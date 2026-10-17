import { IconArrowRight } from "@tabler/icons-react";

import { demoCards } from "./mainContentData";
import { SectionHeading } from "./SectionHeading";

export const ExploreCards = ({ onNavigate }: { onNavigate: (type: string) => void }) => (
  <section>
    <SectionHeading
      eyebrow="More"
      title="Explore more"
      description="Jump straight into a playground, or see the component running in a real app."
    />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {demoCards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onNavigate(card.key)}
            className="group relative flex flex-col items-start rounded-xl border border-solid border-gray-200 bg-white p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-6)] dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/[0.06]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Icon size={16} />
            </span>
            <span className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-gray-900 dark:text-white">
              {card.title}
              <IconArrowRight
                size={13}
                className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60"
              />
            </span>
            <span className="mt-1 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">
              {card.description}
            </span>
          </button>
        );
      })}
    </div>
  </section>
);
