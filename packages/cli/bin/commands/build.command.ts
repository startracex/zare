import type { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import renderer from 'zare/dist/core/renderer.js';
import { loadZareConfig } from '../utils/loadZareConfig.js';
import { cpDir, getAllFiles } from '../utils/fs.js';

function generateAllPaths(
  pathTemplate: string,
  params: Record<string, (string | number)[]> = {},
): Record<string, Record<string, string | number>> {
  const paramNames =
    pathTemplate.match(/\[(\w+)\]/g)?.map(match => match.slice(1, -1)) || [];

  const pathMap: Record<string, Record<string, string | number>> = {};
  let allPaths = [{ path: pathTemplate, params: {} }];

  for (const param of paramNames) {
    const newPaths = [];

    for (const item of allPaths) {
      const iter = params[param];
      if (!iter) {
        continue;
      }
      for (const value of iter) {
        const newPath = item.path.replace(`[${param}]`, value + '');
        const newParams = { ...item.params, [param]: value };
        newPaths.push({ path: newPath, params: newParams });
      }
    }

    allPaths = newPaths;
  }

  allPaths.forEach(item => {
    pathMap[item.path] = item.params;
  });

  return pathMap;
}

async function renderPage(
  pagePath: string,
  outputPath: string,
  renderOptions: Record<string, any> = {},
) {
  const fileContent = await fs.readFile(pagePath, 'utf-8');
  const outputHtmlContent = await renderer(
    fileContent,
    renderOptions,
    pagePath,
  );
  if (!(await fs.exists(outputPath))) {
    await fs.createFile(outputPath);
  }
  await fs.writeFile(outputPath, outputHtmlContent);
}

export function buildCommand(program: Command) {
  program
    .command('build [projectPath]')
    .action(async (projectPath: string = '.') => {
      try {
        const zareConfigurations = await loadZareConfig(
          path.resolve(projectPath),
        );

        const projectDestination = path.resolve(projectPath);
        const outDir = path.resolve(projectPath, zareConfigurations.outdir);

        logger.action('checking project destination');

        // Check if project directory exist or not
        if (!(await fs.pathExists(projectDestination))) {
          logger.error(`Project path does not exists: ${projectDestination}`);
          process.exit(1);
        }

        if (!(await fs.stat(projectDestination)).isDirectory()) {
          logger.error(`Project path is not a folder: ${projectDestination}`);
          process.exit(1);
        }

        // Check if outdir exist if not create one.
        if (!(await fs.pathExists(outDir))) {
          await fs.mkdir(outDir, { recursive: true });
          logger.info('output directory created');
        }

        logger.action('loading pages');
        const pagesDir = path.join(
          projectDestination,
          zareConfigurations.pages,
        );
        const pagePaths = (await getAllFiles(pagesDir)).filter(f =>
          f.toLowerCase().endsWith('.zare'),
        );

        for (const pagePath of pagePaths) {
          const fileBaseName = path
            .relative(pagesDir, pagePath)
            .slice(0, -'.zare'.length)
            .replace(/\\/g, '/');

          const staticParams = /\[(\w+)\]/.test(fileBaseName)
            ? await zareConfigurations.generateStaticParams?.(fileBaseName)
            : undefined;

          const allPaths = generateAllPaths(fileBaseName, staticParams);

          for (const generatedPath in allPaths) {
            const outputPath = path.join(outDir, `${generatedPath}.html`);
            await renderPage(pagePath, outputPath, {
              params: allPaths[generatedPath],
            });
          }
        }

        // Copying all included files and folders
        (Array.isArray(zareConfigurations.static)
          ? zareConfigurations.static
          : [zareConfigurations.static]
        ).forEach(async staticItem => {
          const staticDest = path.resolve(projectPath, staticItem);
          await fs.mkdir(outDir, { recursive: true });
          await cpDir(staticDest, outDir);
        });

        logger.done('build complete');
      } catch (error) {
        if (error instanceof Error)
          logger.error(`Failed to build project: ${error.message}`);
        else logger.error(`${error}`);
        process.exit(1);
      }
    });
}
