import { dirname, join, resolve } from 'path';
import { readdir } from 'fs/promises';
import type { Dirent } from 'fs';
import { importModule } from 'tscute';

export interface ZareCoreConfig {
  generateStaticParams?: (
    path?: string,
  ) => Record<string, any> | Promise<Record<string, any>>;
  static?: string | string[];
}

export async function findUp(
  rootDir: string,
  filter: (path: string, entry: Dirent<string>) => boolean,
): Promise<string | undefined> {
  let currentDir = resolve(rootDir);

  while (true) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const path = join(currentDir, entry.name);
          if (filter(path, entry)) {
            return path;
          }
        }
      }
    } catch (err) {}

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
}

export function isZareConfig(_: string, entry: Dirent<string>) {
  return /zare\.config\.(js|ts|mts|cts|mjs|cjs)$/i.test(entry.name);
}

export async function loadConfig(
  root: string,
): Promise<[string | undefined, ZareCoreConfig | null]> {
  const path = await findUp(root, isZareConfig);

  if (!path) {
    return [path, null];
  }
  return [path, await importModule(path)]
}

export function toArray() { }