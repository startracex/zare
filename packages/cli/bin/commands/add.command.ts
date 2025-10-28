import type { Command } from 'commander';
import { logger } from '../utils/logger.js';
import fsExtra from 'fs-extra';
import { ZareConfig } from 'zare/config.js';
import path from 'path';

export const addCommand = (program: Command) => {
  program
    .command('add <componentName> [componentUrl] [projectFolder]')
    .description('Install a component as dependency')
    .action(
      async (
        componentName: string,
        componentUrl: string = 'IsmailBinMujeeb/zare/main',
        projectFolder: string = '.',
      ) => {
        try {
          const zareConfig = await ZareConfig.find(path.resolve(projectFolder));
          const rootDir = zareConfig.configDir || projectFolder;
          const baseUrl = `https://raw.githubusercontent.com/${componentUrl}`;

          logger.info`Fetching components.json`;
          const response = await fetch(
            new URL(`${baseUrl}/components.json`).toString(),
          );

          const text = await response.text();

          if (!response.ok) {
            logger.error`Failed to fetch components.json from ${baseUrl}/components.json: ${response.status} ${response.statusText}`;
            process.exit(1);
          }

          const json = JSON.parse(text);

          const componentConfig = json[componentName];

          if (!componentConfig) {
            logger.error`component ${componentName} not found`;
            process.exit(1);
          }

          const componentRemoteFilePath = new URL(
            `${baseUrl}${componentConfig.component}`,
          ).toString();

          logger.info`Installing component from ${componentRemoteFilePath}`;
          const zareComponentResponse = await fetch(componentRemoteFilePath);

          if (!zareComponentResponse.ok) {
            logger.error`Failed to fetch component from ${componentRemoteFilePath}: ${zareComponentResponse.status} ${zareComponentResponse.statusText}`;
            process.exit(1);
          }

          const zareComponentText = await zareComponentResponse.text();

          const installedComponentFilePath = path.resolve(
            rootDir,
            'components',
            `${componentName}.zare`,
          );

          logger.info`Creating ${installedComponentFilePath}`;

          await fsExtra.outputFile(
            installedComponentFilePath,
            zareComponentText,
          );

          if (!componentConfig.staticFiles) {
            return logger.done`Component ${componentName} added successfully`;
          }

          logger.info`Creating static files`;
          await Promise.all(
            componentConfig.staticFiles?.map(async (file: string) => {
              const depFileName = file.split('/')?.[file.split('/').length - 1];

              await Promise.all(
                zareConfig.options.staticDir.map(async staticItem => {
                  const depFilePath = path.resolve(
                    rootDir,
                    staticItem,
                    `/deps/${depFileName}`,
                  );

                  const staticFileResponse = await fetch(
                    new URL(`${baseUrl}${file}`).toString(),
                  );

                  if (!staticFileResponse.ok) {
                    return logger.error`Failed to fetch static file ${file}: ${staticFileResponse.status} ${staticFileResponse.statusText}`;
                  }

                  const text = await staticFileResponse.text();
                  await fsExtra.outputFile(depFilePath, text);
                }),
              );
            }),
          );

          logger.done`Component ${componentName} added successfully`;
        } catch (error) {
          if (error instanceof Error)
            logger.error`failed to initialize project: ${error.message}`;
          process.exit(1);
        }
      },
    );
};
