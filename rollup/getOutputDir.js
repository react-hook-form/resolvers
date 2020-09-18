/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path');
const ts = require('typescript');

/**
 * It retrieves `outDir` path from tsconfig and returns output dir path
 * @param {string} tsconfig tsconfig path `tsconfig.json`
 * @param {string | undefined} path path to join (ex for umd => `/my-project/outdir/umd`)
 */
function getOutputDir(tsconfig, path = '') {
  const tsconfigPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    tsconfig,
  );
  const tsconfigJson = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const tscompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJson.config,
    ts.sys,
    './',
  ).options;

  const { outDir } = tscompilerOptions;

  return path ? join(outDir, path) : outDir;
}

module.exports = getOutputDir;
