import type { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import renderer from 'zare/dist/core/renderer.js';
import { loadZareConfig } from '../utils/loadZareConfig.js';
import { cpDir } from '../utils/cpdir.js';

export function buildCommand(program: Command) {
  program
    .command('build [projectPath]')
    .action(async (projectPath: string = '.') => {
      try {
        const zareConfigurations = await loadZareConfig(
          path.resolve(projectPath),
        );

        const projectDestination = path.resolve(
          projectPath,
          zareConfigurations.pages,
        );
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
        const pagesFile = await fs.readdir(projectDestination, 'utf-8');

        for (const file of pagesFile) {
          const filePath = path.resolve(projectDestination, file).trimEnd();
          const fileExtension = path.extname(filePath).toLowerCase();

          if (fileExtension !== '.zare') {
            logger.warn(`can't load ${fileExtension} files`);
            continue;
          }

          const fileBaseName = path.basename(filePath, fileExtension);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const outputHtmlContent = await renderer(fileContent, {}, filePath);

          const outputHtmlFileNameWithExtension = `${fileBaseName}.html`;
          const outputHtmlFilePath = path.resolve(
            outDir,
            outputHtmlFileNameWithExtension,
          );

          if (!(await fs.exists(outputHtmlFilePath))) {
            await fs.createFile(outputHtmlFilePath);
          }

          await fs.writeFile(outputHtmlFilePath, outputHtmlContent);
        }

        // Copying all included files and folders
        const includesFilesAndFolders = zareConfigurations.includes;

        includesFilesAndFolders.forEach(async f => {
          const fPath = path.resolve(process.cwd(), projectPath, f);
          const fDestination = path.resolve(outDir, f);

          if (!(await fs.exists(fPath))) {
            return logger.warn(`${fPath} does not exist`);
          }

          await cpDir(fPath, fDestination);
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
