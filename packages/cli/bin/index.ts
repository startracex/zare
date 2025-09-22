#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.command.js';
import { buildCommand } from './commands/build.command.js';
import { serveCommand } from './commands/serve.command.js';
import { cli } from './config/package.config.js';

const program = new Command();

program.name('zare').version(cli.version);

initCommand(program);
buildCommand(program);
serveCommand(program);

program.parse(process.argv);
