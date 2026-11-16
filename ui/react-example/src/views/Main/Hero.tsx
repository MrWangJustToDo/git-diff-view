import { CopyButton } from "@mantine/core";
import { IconArrowRight, IconBrandGithub, IconCheck, IconCopy } from "@tabler/icons-react";

import { frameWorkNames, goto, installCmd } from "./mainContentData";

const codeLines: { text: string; kind?: "key" | "str" | "fn" | "cmt" | "punc" | "tag" | "attr" }[][] = [
  [
    { text: "import", kind: "key" },
    { text: " { ", kind: "punc" },
    { text: "DiffView", kind: "fn" },
    { text: " } ", kind: "punc" },
    { text: "from", kind: "key" },
    { text: ' "@git-diff-view/react"', kind: "str" },
    { text: ";", kind: "punc" },
  ],
  [{ text: "" }],
  [{ text: "// diffFile comes from generateDiffFile()", kind: "cmt" }],
  [
    { text: "\u003c", kind: "punc" },
    { text: "DiffView", kind: "tag" },
  ],
  [
    { text: "  diffFile", kind: "attr" },
    { text: "={", kind: "punc" },
    { text: "diffFile", kind: "fn" },
    { text: "}", kind: "punc" },
  ],
  [
    { text: "  diffViewMode", kind: "attr" },
    { text: "={", kind: "punc" },
    { text: ".", kind: "punc" },
    { text: "Split", kind: "fn" },
    { text: "}", kind: "punc" },
  ],
  [{ text: "  diffViewHighlight", kind: "attr" }],
  [{ text: "  diffViewWrap", kind: "attr" }],
  [{ text: "/>", kind: "punc" }],
];

/**
 * Opening section. The right column is a real code sample rather than a screenshot: it gives the
 * hero a visual anchor and says "small, declarative API" before the reader has scrolled at all.
 */
export const Hero = () => (
  <section className="lp-hero lp-page border-b border-solid border-[var(--line-soft)]">
    <div className="mx-auto w-full max-w-[1120px] px-6 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
      <div className="grid grid-cols-1 items-center gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
        <div>
          <div className="flex items-center gap-3">
            <p className="lp-eyebrow">Git diff view</p>
            <span className="rounded-full border border-solid border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--ink-faint)]">
              v0.1 · Lynx support
            </span>
          </div>

          <h1 className="lp-title mt-4 text-[clamp(2.25rem,1.4rem+3vw,3.75rem)]">
            A diff view for
            <br />
            every framework
          </h1>

          <p className="lp-lead mt-5 max-w-[54ch]">
            Parse, highlight and render any git diff — split or unified — with one consistent API across React, Vue,
            Solid, Svelte, Lynx and the terminal.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <CopyButton value={installCmd} timeout={2000}>
              {({ copied, copy }) => (
                <button type="button" onClick={copy} className="lp-cmd">
                  <span className="text-[var(--ink-faint)]">$</span>
                  {installCmd}
                  {copied ? (
                    <IconCheck size={13} className="text-[var(--accent)]" />
                  ) : (
                    <IconCopy size={13} className="text-[var(--ink-faint)]" />
                  )}
                </button>
              )}
            </CopyButton>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goto("git-playground")}
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13.5px] font-medium text-[var(--on-accent)] transition-opacity hover:opacity-90"
            >
              Open the playground
              <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="https://github.com/MrWangJustToDo/git-diff-view"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-solid border-[var(--line)] px-4 py-2 text-[13.5px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              <IconBrandGithub size={15} />
              Source
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2 text-[12px] text-[var(--ink-faint)]">
            {frameWorkNames.map((name) => (
              <li key={name} className="rounded-md border border-solid border-[var(--line)] px-2 py-0.5">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-code">
          <div className="lp-code-bar">
            <span className="lp-code-dot" />
            <span className="lp-code-dot" />
            <span className="lp-code-dot" />
            <span className="ml-2">review.tsx</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.1em] text-[#5f6773]">tsx</span>
          </div>

          <pre className="lp-code-body">
            {codeLines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-4 shrink-0 select-none text-right text-[#3d434d]">{i + 1}</span>
                <span className="whitespace-pre">
                  {line.map((token, j) =>
                    token.kind ? (
                      <span key={j} className={`tok-${token.kind}`}>
                        {token.text}
                      </span>
                    ) : (
                      <span key={j}>{token.text}</span>
                    )
                  )}
                  {line.every((t) => !t.text) ? " " : null}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  </section>
);
