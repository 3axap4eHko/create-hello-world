#!/usr/bin/env node

import { readFile, writeFile, copyFile, readdir, mkdir } from 'fs/promises';
import { resolve, join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

const APP_PATH = resolve(process.cwd(), process.argv[2]);
const APP_REL_PATH = relative(process.cwd(), APP_PATH);
const LIB_DIR = fileURLToPath(new URL('.', import.meta.url));

(async () => {
  if (!APP_PATH) {
    throw new Error('Please specify the project directory');
  }
  const APP_NAME = dirname(APP_PATH);
  const TEMPLATE_PATH = resolve(LIB_DIR, 'templates');

  console.log('Creating a new Hello World app in %s:', chalk.yellow(APP_NAME));
  await mkdir(APP_PATH, { recursive: true });

  process.chdir(APP_PATH);
  execSync('npm init -y');

  const files = await readdir(TEMPLATE_PATH);
  await Promise.all(files.map(file => copyFile(join(TEMPLATE_PATH, file), join(APP_PATH, file))));
  await copyFile(join(LIB_DIR, '.gitignore'), join(APP_PATH, '.gitignore'));

  const packageJSON = JSON.parse(await readFile('package.json', 'utf8'));
  packageJSON.type = 'module';
  packageJSON.scripts.start = 'node index.js';
  packageJSON.scripts.debug = 'node --inspect-brk index.js';
  await writeFile('package.json', JSON.stringify(packageJSON, null, 2));

  console.log('Success! Created Hello World at %s', chalk.yellow(APP_NAME));
  console.log('Inside that directory, you can run several commands:\n');
  console.log(chalk.blue('npm run start'));
  console.log('  Starts the app\n');
  console.log(chalk.blue('npm run debug'));
  console.log('  Starts the app in debug mode\n');
  console.log('We suggest that you begin by typing:\n');
  console.log('cd %s', chalk.blue(APP_REL_PATH));
  console.log(chalk.blue('npm run start'));
})().catch(error => {
  console.error(chalk.red(error.message));
  console.error('Usage:', chalk.blue('create-hello-world'), chalk.green('<project-directory>'));
  process.exit(1);
});


