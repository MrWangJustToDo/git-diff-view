import { capabilities } from "./mainContentData";
import { SectionHeading } from "./SectionHeading";

export const CapabilitiesGrid = () => (
  <section>
    <SectionHeading
      eyebrow="Capabilities"
      title="Everything a diff view needs"
      description="Parse, highlight and render any diff — with the same API on every framework."
    />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {capabilities.map((cap, idx) => {
        const Icon = cap.icon;
        return (
          <div
            key={cap.label}
            className="group relative rounded-xl border border-solid border-gray-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-6)] dark:hover:border-indigo-500/50"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Icon size={18} />
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.1em] text-gray-300 dark:text-gray-600">
                0{idx + 1}
              </span>
            </div>
            <div className="mt-4 text-[13.5px] font-semibold text-gray-900 dark:text-white">{cap.label}</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500 dark:text-gray-400">{cap.description}</p>
          </div>
        );
      })}
    </div>
  </section>
);
