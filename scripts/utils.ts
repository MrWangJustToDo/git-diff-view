import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const copyDir = async (srcDir: string, tarDir: string) => {
  const srcPath = resolve(process.cwd(), "packages", srcDir);
  const tarPath = resolve(process.cwd(), "packages", tarDir);
  await mkdir(tarPath, { recursive: true }).catch(() => void 0);
  const files = await readdir(srcPath);
  for (const file of files) {
    if (file.endsWith("index.ts")) continue;
    const srcFilePath = resolve(srcPath, file);
    const tarFilePath = resolve(tarPath, file);
    await writeFile(tarFilePath, await readFile(srcFilePath));
  }
};

export const preSvelte = async () => await copyDir("utils/src", "svelte/src/lib/utils");
