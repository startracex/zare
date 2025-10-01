import type { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import app from '../server.js';
import { ZareRouter } from '../utils/zareRouter.js';
import { startWatcher } from '../utils/watcher.js';
import { logger } from '../utils/logger.js';
import { loadZareConfig } from '../utils/loadZareConfig.js';
import express from 'express';
import { getAllFiles } from '../utils/fs.js';

export function serveCommand(program: Command) {
  program
    .command('serve [projectPath]')
    .action(async (projectPath: string = '.') => {
      try {
        const projectDestination = path.resolve(projectPath);

        // Check if project directory exist or not
        if (!(await fs.pathExists(projectDestination))) {
          logger.error(`Project path does not exists: ${projectDestination}`);
          process.exit(1);
        }

        if (!(await fs.stat(projectDestination)).isDirectory()) {
          logger.error(`Project path is not a folder: ${projectDestination}`);
          process.exit(1);
        }

        const zareConfigurations = await loadZareConfig(projectDestination);
        const pagesDestination = path.resolve(
          projectDestination,
          zareConfigurations.pages,
        );

        // pages as views
        app.set('views', pagesDestination);

        (Array.isArray(zareConfigurations.static)
          ? zareConfigurations.static
          : [zareConfigurations.static]
        ).forEach(staticItem => {
          const staticDest = path.resolve(projectDestination, staticItem);
          app.use(express.static(staticDest));
        });

        // Check if project directory exist or not
        if (!(await fs.pathExists(pagesDestination))) {
          logger.error(`Pages folder does not exists: ${pagesDestination}`);
          process.exit(1);
        }

        logger.action('loading files');
        await fileRoutingHandler(pagesDestination);

        const PORT = zareConfigurations.port;
        app.set('port', PORT);

        const server = app.listen(PORT, () => {
          logger.done(`Server is running at http://localhost:${PORT}`);
        });

        startWatcher(pagesDestination, server);
      } catch (error) {
        if (error instanceof Error)
          logger.error(`Failed to build project: ${error.message}`);
        process.exit(1);
      }
    });
}

async function fileRoutingHandler(pagesDir: string) {
  const routes: string[] = (await getAllFiles(pagesDir))
    .filter(pagePath => pagePath.endsWith('.zare'))
    .map(pagePath => {
      const baseName = path
        .relative(pagesDir, pagePath)
        .slice(0, -'.zare'.length)
        .replace(/\\/g, '/');
      return (
        '/' +
        (baseName.endsWith('/index')
          ? baseName.slice(0, -'/index'.length)
          : baseName)
      );
    });

  const router = new ZareRouter(routes);
  router.loadRoutes(app);
  app.use(`/`, router.getRoutes());
}
