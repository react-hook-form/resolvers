/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const path = require('path');
const pkg = require('../package.json');
const getOutputdir = require('./getOutputDir');

function writeCjsEntryFile(
  name = pkg.name,
  formatName = 'cjs',
  tsconfig = 'tsconfig.json',
) {
  const baseLine = `module.exports = require('./${name}`;
  const contents = `
'use strict'

if (process.env.NODE_ENV === 'production') {
  ${baseLine}.${formatName}.production.min.js')
} else {
  ${baseLine}.${formatName}.development.js')
}
`;

  const dir = getOutputdir(tsconfig);

  const filename =
    formatName === 'cjs'
      ? [name, 'js'].join('.')
      : [name, formatName, 'js'].join('.');

  return fs.outputFile(path.join(dir, 'cjs', filename), contents);
}

writeCjsEntryFile('index');
