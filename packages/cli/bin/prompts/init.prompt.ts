import fs from 'fs-extra';
import inquirer from 'inquirer';
import { basename, join, resolve } from 'path';

export interface InitPrompts {
  packageName?: string;
  projectPath?: string;
}

export async function askInitPrompts({
  defaultPath,
}: {
  defaultPath: string;
}): Promise<InitPrompts> {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '📁 Project path:',
      default: defaultPath || 'myapp',
      when: !defaultPath,
    },
    {
      type: 'input',
      name: 'packageName',
      message: '📦 Package name:',
      default: answers => {
        return basename(resolve(answers.projectPath || defaultPath));
      },
      when: async answers => {
        return !(await fs.exists(
          join(answers.projectPath || defaultPath, 'package.json'),
        ));
      },
    },
  ]);
}
