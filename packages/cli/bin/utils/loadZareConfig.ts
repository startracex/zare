import { dirname, resolve } from 'path';
import { config } from 'zare/config.js';
import { loadConfig, type ZareCoreConfig } from 'zare/utils/shared.js';

interface IZareConfig extends ZareCoreConfig {
  port?: number;
  outdir?: string;
  pages?: string;
  tailwind?: boolean;
}

export async function loadZareConfig(searchFrom: string): Promise<IZareConfig> {
  const configs = await loadConfig(searchFrom);
  config.configPath = configs[0];
  config.userConfig = {
    port: 8185,
    static: './static',
    outdir: './dist',
    pages: './pages',
    tailwind: false,
    ...configs[1],
  } as IZareConfig;

  config.userConfig.static = Array.isArray(config.userConfig.static)
    ? config.userConfig.static
    : [config.userConfig.static!].map((s) =>
        resolve(dirname(config.configPath || process.cwd()), s),
      );

  return config.userConfig;
}
