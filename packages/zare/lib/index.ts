import renderer from './core/renderer.js';
import fs from 'fs';
import { relative } from 'path';
import { ZareConfig } from './config.js';

const staticParams = new Map();

export async function __express(
  filePath: string,
  options: Record<string, any>,
  cb: (err: Error | null, html?: string) => void,
) {
  const config = await ZareConfig.find(process.cwd());

  const pageRoute =
    '/' + relative(filePath, options.settings.views).replace(/\.zare$/i, '');
  let params = staticParams.get(pageRoute);
  if (!params) {
    params = (await config.options.generateStaticParams(pageRoute)) ?? {};
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
          config,
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
