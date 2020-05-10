#!/usr/bin/env node

const { readFile, writeFile, copyFile, readdir } = require('fs').promises;
const { resolve } = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const mkdirp = require('mkdirp');

const APP_NAME = process.argv[2];

(async () => {
  if (!APP_NAME) {
    throw new Error('Please specify the project directory');
  }
  const APP_PATH = resolve(process.cwd(), APP_NAME);
  const TEMPLATE_PATH = resolve(__dirname, 'template');

  console.log('Creating a new Hello World app in %s:', chalk.yellow(APP_PATH));
  await mkdirp(APP_PATH);

  process.chdir(APP_PATH);
  execSync('npm init -y');

  const files = await readdir(TEMPLATE_PATH);
  await Promise.all(files.map(file => copyFile(resolve(TEMPLATE_PATH, file), resolve(APP_PATH, file))));
  
  const package = JSON.parse(await readFile('package.json', 'utf8'));
  package.scripts.start = 'node index.js';
  package.scripts.debug = 'node --inspect-brk index.js';
  await writeFile('package.json', JSON.stringify(package, null, '  '));

  console.log('Success! Created cra at %s', chalk.yellow(APP_PATH));
  console.log('Inside that directory, you can run several commands:\n');
  console.log(chalk.blue('yarn start'));
  console.log('  Starts the app\n');
  console.log(chalk.blue('yarn debug'));
  console.log('  Starts the app in debug mode\n');
  console.log('We suggest that you begin by typing:\n');
  console.log('cd %s:', chalk.blue(APP_NAME));
  console.log(chalk.blue('yarn start'));
})().catch(error => {
  console.error(chalk.red(error.message));
  console.log('Usage:', chalk.blue('create-hello-world'), chalk.green('<project-directory>'));
  process.exit(1);
});


