import { useTabWithRouter } from "../../hooks/useTabWithRouter";

import { PlayGroundFileDiff } from "./PlayGroundFileDiff";
import { PlayGroundGitDiff } from "./PlayGroundGitDiff";

export const PlayGround = () => {
  const tab = useTabWithRouter();

  const goto = (tab: "git" | "file") => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.set("type", "try");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <>
      {tab === "git" ? (
        <PlayGroundGitDiff onClick={() => goto("file")} />
      ) : (
        <PlayGroundFileDiff onClick={() => goto("git")} />
      )}
    </>
  );
};
