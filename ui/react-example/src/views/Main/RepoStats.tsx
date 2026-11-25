import { useEffect, useState } from "react";

import { formatNumber } from "./mainContentData";

interface Stats {
  stars: number;
  downloads: number;
  loading: boolean;
}

const useRepoStats = (): Stats => {
  const [stats, setStats] = useState<Stats>({ stars: 0, downloads: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [githubRes, npmRes] = await Promise.all([
          fetch("https://api.github.com/repos/MrWangJustToDo/git-diff-view"),
          fetch("https://api.npmjs.org/downloads/point/last-month/@git-diff-view/core"),
        ]);
        const [githubData, npmData] = await Promise.all([githubRes.json(), npmRes.json()]);
        setStats({ stars: githubData.stargazers_count || 0, downloads: npmData.downloads || 0, loading: false });
      } catch {
        setStats({ stars: 0, downloads: 0, loading: false });
      }
    };
    fetchStats();
  }, []);

  return stats;
};

/**
 * Hard numbers straight under the hero: they carry more weight than any marketing sentence.
 */
export const StatBand = () => {
  const stats = useRepoStats();

  const items = [
    { label: "GitHub stars", value: stats.loading ? "—" : formatNumber(stats.stars) },
    { label: "Downloads / month", value: stats.loading ? "—" : formatNumber(stats.downloads) },
    { label: "Frameworks", value: "6" },
    { label: "Diff modes", value: "2" },
    { label: "Core, gzip", value: "~14 kB" },
  ];

  return (
    <div className="lp-page border-b border-solid border-[var(--line-soft)]">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-8">
        {/*
         * The hero already draws the hairline above this band, and the wrapper draws the one below,
         * so the grid itself must stay borderless — an inset `border-y` here doubled both rules.
         *
         * The divider is a cell's left border, so the gutter has to live on the cells: `pl-4` after
         * the first keeps the text off the line, `pr-4` breathes before the next one, and the outer
         * edges stay flush with the container to line up with the sections above and below.
         */}
        <div className="grid grid-cols-2 lg:grid-cols-5">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`lp-stat ${i > 0 ? "border-l border-solid border-[var(--line-soft)] pl-4" : ""} ${
                i < items.length - 1 ? "pr-4" : ""
              } ${i >= 2 ? "max-lg:hidden lg:flex" : ""}`}
            >
              <span className="lp-stat-value">{item.value}</span>
              <span className="lp-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
