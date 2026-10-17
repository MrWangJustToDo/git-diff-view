import { CopyButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowRight, IconBrandGithub, IconCheck, IconCopy, IconDownload, IconStar } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { HeroDiffPreview, heroDiffStat } from "../../components/Hero/HeroDiffPreview";

import { formatNumber, frameWorkNames, goto, installCmd } from "./mainContentData";

interface StatsData {
  stars: number;
  downloads: number;
  loading: boolean;
}

const useRepoStats = () => {
  const [stats, setStats] = useState<StatsData>({ stars: 0, downloads: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [githubRes, npmRes] = await Promise.all([
          fetch("https://api.github.com/repos/MrWangJustToDo/git-diff-view"),
          fetch("https://api.npmjs.org/downloads/point/last-month/@git-diff-view/core"),
        ]);
        const [githubData, npmData] = await Promise.all([githubRes.json(), npmRes.json()]);
        setStats({
          stars: githubData.stargazers_count || 0,
          downloads: npmData.downloads || 0,
          loading: false,
        });
      } catch {
        setStats({ stars: 0, downloads: 0, loading: false });
      }
    };
    fetchStats();
  }, []);

  return stats;
};

/** Dark editor shell — the single strongest contrast anchor on the light page. */
const HeroWindow = ({ compact }: { compact: boolean }) => {
  const stat = heroDiffStat[compact ? "compact" : "wide"];

  return (
    <div className="relative">
      <div className="hero-window-glow" aria-hidden />
      <div className="hero-window relative overflow-hidden rounded-xl">
        <div className="flex h-9 items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-3.5">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-white/75">
              Review.tsx
            </span>
            <span className="hidden truncate rounded-md px-2 py-0.5 font-mono text-[11px] text-white/25 sm:inline">
              DiffView.tsx
            </span>
            <span className="hidden truncate rounded-md px-2 py-0.5 font-mono text-[11px] text-white/20 md:inline">
              +1
            </span>
          </div>
          <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
            {compact ? "unified" : "split"}
          </span>
        </div>

        {/* Deliberate crop: the window reads as a scrollable screen, not a card */}
        <div className="max-h-[280px] overflow-hidden md:max-h-[340px]">
          <HeroDiffPreview compact={compact} />
        </div>

        <div className="flex h-7 items-center gap-3 border-t border-white/[0.07] px-3.5 font-mono text-[10.5px] text-white/30">
          <span className="text-emerald-400/80">+{stat.additions}</span>
          {stat.deletions > 0 && <span className="text-rose-400/80">−{stat.deletions}</span>}
          <span className="ml-auto">TSX</span>
          <span className="hidden sm:inline">UTF-8</span>
        </div>
      </div>
    </div>
  );
};

const InstallCommand = () => (
  <CopyButton value={installCmd} timeout={2000}>
    {({ copied, copy }) => (
      <button
        type="button"
        onClick={copy}
        className="group/cmd flex h-9 items-center gap-2.5 rounded-lg border border-solid border-gray-200 bg-white px-3 text-left transition hover:border-gray-300 dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-6)] dark:hover:border-[var(--mantine-color-dark-3)]"
      >
        <span className="font-mono text-[11.5px] text-indigo-500 dark:text-indigo-400">$</span>
        <span className="font-mono text-[12px] text-gray-600 dark:text-gray-300">{installCmd}</span>
        <span className="ml-auto text-gray-400 transition group-hover/cmd:text-gray-600 dark:text-gray-500">
          {copied ? <IconCheck size={13} className="text-emerald-500" /> : <IconCopy size={13} />}
        </span>
      </button>
    )}
  </CopyButton>
);

const RepoStats = () => {
  const stats = useRepoStats();
  const value = (n: number) => (stats.loading ? "—" : formatNumber(n));

  return (
    <div className="flex items-center gap-4 font-mono text-[11.5px] text-gray-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <IconStar size={12} className="text-amber-500" />
        {value(stats.stars)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconDownload size={12} className="text-sky-500" />
        {value(stats.downloads)}
        <span className="text-gray-400 dark:text-gray-500">/mo</span>
      </span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span className="text-gray-400 dark:text-gray-500">MIT</span>
    </div>
  );
};

const FrameworkRow = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11.5px] text-gray-400 dark:text-gray-500">
    <span className="uppercase tracking-[0.12em] text-gray-300 dark:text-gray-600">works with</span>
    {frameWorkNames.map((name, i) => (
      <span key={name} className={`inline-flex items-center gap-2 ${name === "Ink" ? "hidden sm:inline-flex" : ""}`}>
        {i > 0 && <span className="text-gray-200 dark:text-gray-700">·</span>}
        {name}
      </span>
    ))}
  </div>
);

/** Thin full-bleed band: everything that used to clutter the hero, now one line. */
const MetaBand = () => (
  <div className="-mx-4 border-b border-solid border-gray-100 bg-white dark:border-[var(--mantine-color-dark-5)] dark:bg-[var(--mantine-color-dark-7)]">
    <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-3 px-6 py-3.5 md:flex-row md:justify-between md:gap-6 md:px-10">
      <InstallCommand />
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end">
        <RepoStats />
        <span className="hidden h-3 w-px bg-gray-200 md:block dark:bg-[var(--mantine-color-dark-4)]" />
        <FrameworkRow />
      </div>
    </div>
  </div>
);

export const HeroSection = () => {
  const isCompact = useMediaQuery("(max-width: 767px)");

  return (
    <>
      <section className="hero-canvas relative -mx-4 -mt-4 overflow-hidden border-b border-solid border-gray-100 dark:border-[var(--mantine-color-dark-5)]">
        <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-glow hero-glow-a" aria-hidden />

        <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-9 pt-11 md:px-10 md:pb-10 md:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-solid border-gray-200 bg-white/80 px-2.5 py-1 shadow-sm dark:border-[var(--mantine-color-dark-5)] dark:bg-[var(--mantine-color-dark-6)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                v0.1.0 · Lynx support
              </span>
            </div>

            <h1 className="mt-5 text-balance text-[2rem] font-extrabold leading-[1.06] tracking-[-0.04em] text-gray-900 sm:text-[2.5rem] lg:text-[2.9rem] dark:text-white">
              A Diff View built for{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                your stack
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-[38rem] text-[15px] leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
              Split &amp; unified modes, syntax highlighting and one consistent API across React, Vue, Solid, Svelte,
              Lynx and the terminal.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => goto("git-playground")}
                className="group inline-flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-4 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.7)] transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Try Playground
                <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="https://github.com/MrWangJustToDo/git-diff-view"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-solid border-gray-200 bg-white px-4 text-[13.5px] font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900 dark:border-[var(--mantine-color-dark-4)] dark:bg-[var(--mantine-color-dark-6)] dark:text-gray-300 dark:hover:text-white"
              >
                <IconBrandGithub size={16} />
                GitHub
              </a>
            </div>
          </div>

          <div className="mt-9 md:mt-10">
            <HeroWindow compact={isCompact} />
          </div>
        </div>
      </section>

      <MetaBand />
    </>
  );
};
