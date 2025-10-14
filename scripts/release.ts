import { readFile } from "fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "path";

const pkgNameAlias = {
  "@git-diff-view/core": "core",
  "@git-diff-view/vue": "vue",
  "@git-diff-view/file": "file",
  "@git-diff-view/react": "react",
  "@git-diff-view/lowlight": "lowlight",
  "@git-diff-view/shiki": "shiki",
  "@git-diff-view/solid": "solid",
  "@git-diff-view/svelte": "svelte",
  "@git-diff-view/cli": "cli",
};

const getVersion = (pkgName: string) =>
  new Promise((a, b) => {
    const ls = spawn(`pnpm view ${pkgName} version --json`, { shell: true, stdio: "pipe" });
    ls.stdout.on("data", (d) => {
      const res = Buffer.from(d).toString("utf-8");
      a(JSON.parse(res));
    });
    ls.on("error", (e) => b(e));
  });

const publish = (pnkName: string, cwd: string) => {
  return new Promise((a, b) => {
    const ls = spawn(`pnpm publish --access public`, { shell: true, stdio: "inherit", cwd });
    ls.on("close", () => {
      a(true);
    });
    ls.on("error", (e) => b(e));
  });
};

const release = async (pkgName: keyof typeof pkgNameAlias) => {
  if (!pkgNameAlias[pkgName]) return;
  const path = "packages/" + pkgNameAlias[pkgName];

  const packagesFile = resolve(process.cwd(), path, "package.json");

  const data = await readFile(packagesFile, { encoding: "utf-8" });

  const pkgObj = JSON.parse(data);

  const version = pkgObj.version;

  try {
    const cVersion = await getVersion(pkgName);

    if (cVersion === version) {
      console.log(`no need release ${pkgName} @${version}`);
      return;
    } else {
      console.log(`new version: ${version} of ${pkgName} will release, current is: ${cVersion}`);
    }

    await publish(pkgName, resolve(process.cwd(), path));

    console.log(`success release ${pkgName} @${version}`);
  } catch (e) {
    console.log(e);
  }
};

const run = async () => {
  console.log("start release @git-dff-view packages");
  await release("@git-diff-view/lowlight");
  await release("@git-diff-view/shiki");
  await release("@git-diff-view/core");
  await release("@git-diff-view/file");
  await release("@git-diff-view/react");
  await release("@git-diff-view/vue");
  await release("@git-diff-view/solid");
  await release("@git-diff-view/svelte");
  await release("@git-diff-view/cli");
  console.log("release @git-dff-view packages done");
};

run();
