import renderer from './core/renderer.js';
import fs from 'fs';
import { findUp, isZareConfig } from './utils/shared.js';
import { dirname, relative, resolve } from 'path';
import { config } from './config.js';
import { importModule } from 'tscute';

const staticParams = new Map();

export async function __express(
  filePath: string,
  options: Record<string, any>,
  cb: (err: Error | null, html?: string) => void,
) {
  config.configPath ??=
    (await findUp(options.settings.views, isZareConfig)) ?? '';

  config.userConfig ??=
    (config.configPath ? await importModule(config.configPath) : undefined) ??
    {};

  const staticDirs: string[] = (
    Array.isArray(config.userConfig.static)
      ? config.userConfig.static
      : [config.userConfig.static ?? './static']
  ).map(s => {
    return resolve(dirname(config.configPath || process.cwd()), s);
  });
  config.userConfig.static = staticDirs;

  const pageRoute =
    '/' + relative(filePath, options.settings.views).replace(/\.zare$/i, '');
  let params = staticParams.get(pageRoute);
  if (!params) {
    params = (await config.userConfig.generateStaticParams?.(pageRoute)) ?? {};
  }
  try {
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) return cb(err);

      try {
        const rendered = renderer(
          content,
          {
            ...options,
            params: {
              ...options.params,
              ...params,
            },
          },
          filePath,
        );
        cb(null, rendered);
      } catch (renderError) {
        cb(renderError as Error);
      }
    });
  } catch (error) {
    cb(error as Error);
  }
}
