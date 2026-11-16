import { CopyButton } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";

import { CliPlayGround, ReactPlayGround, VuePlayGround } from "../../components/PlayGround";

const frameworks = [
  { key: "react", label: "React", command: "npm install @git-diff-view/react" },
  { key: "vue", label: "Vue", command: "npm install @git-diff-view/vue" },
  { key: "cli", label: "Ink (terminal)", command: "npm install @git-diff-view/cli" },
] as const;

type FrameworkKey = (typeof frameworks)[number]["key"];

/**
 * Quick start: a tabbed install line plus one sandbox.
 */
export const QuickStartSection = () => {
  const [active, setActive] = useState<FrameworkKey>("react");

  const current = frameworks.find((f) => f.key === active) ?? frameworks[0];

  return (
    <section className="lp-band border-t border-solid border-[var(--line-soft)]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-12 md:px-8 md:py-16">
        <p className="lp-eyebrow">Quick start</p>
        <h2 className="lp-title mt-2 text-[1.6rem]">Two lines and one file</h2>

        <div className="lp-card mt-8 overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 border-b border-solid border-[var(--line-soft)] px-3 py-2">
            {frameworks.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActive(f.key)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11.5px] transition-colors ${
                  active === f.key
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}

            <CopyButton value={current.command} timeout={2000}>
              {({ copied, copy }) => (
                <button
                  type="button"
                  onClick={copy}
                  className="ml-auto inline-flex items-center gap-2 font-mono text-[11.5px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                >
                  <span className="text-[var(--ink-faint)]">$</span>
                  {current.command}
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                </button>
              )}
            </CopyButton>
          </div>

          {active === "react" && <ReactPlayGround />}
          {active === "vue" && <VuePlayGround />}
          {/* The CliPlayGround relies on @my-react internals, so it only runs on the @my-react runtime. */}
          {active === "cli" && __MY_REACT__ && <CliPlayGround />}
          {active === "cli" && !__MY_REACT__ && (
            <div className="px-6 py-16 text-center text-[13px] text-[var(--ink-faint)]">
              The terminal example is only available on the @my-react runtime.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
