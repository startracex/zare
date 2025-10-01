import renderer from './core/renderer.js';
import fs from 'fs';


export function __express(
  filePath: string,
  options: Record<string, any>,
  cb: (err: Error | null, html?: string) => void,
) {
  try {
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) return cb(err);

      try {
        const rendered = renderer(content, options, filePath);
        cb(null, rendered);
      } catch (renderError) {
        cb(renderError as Error);
      }
    });
  } catch (error) {
    cb(error as Error);
  }
}
