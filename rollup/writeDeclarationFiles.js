/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const { exec } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const getOutputDir = require('./getOutputDir');
const pkg = require('../package.json');

const log = console.log;

const hasYarn = (cwd = process.cwd()) =>
  fs.existsSync(path.resolve(cwd, 'yarn.lock'));

/**
 *
 * @param {string | undefined} tsconfig tsconfig path `tsconfig.json`
 */
function writeDeclarationFiles(tsconfig = 'tsconfig.json') {
  const outputDir = getOutputDir(tsconfig, 'types');
  log(chalk.bold.cyan(`${pkg.source} → ${outputDir}...`));

  exec(
    `${
      hasYarn ? 'yarn' : 'npx'
    } tsc --emitDeclarationOnly --declaration --noEmit false --outDir ${outputDir}`,
    (error) => {
      if (error) {
        console.error(error);
        return;
      }

      log(chalk.green`created {bold ${outputDir}}`);
    },
  );
}

writeDeclarationFiles();
