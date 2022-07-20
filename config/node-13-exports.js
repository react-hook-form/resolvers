// Original source: https://github.com/preactjs/preact/blob/master/config/node-13-exports.js
const fs = require('fs');

const subRepositories = [
  'zod',
  'joi',
  'vest',
  'yup',
  'superstruct',
  'class-validator',
  'io-ts',
  'nope',
  'computed-types',
  'typanion',
  'ajv',
  `ajv-formats`,
];

const copySrc = () => {
  // Copy .module.js --> .mjs for Node 13 compat.
  fs.writeFileSync(
    `${process.cwd()}/dist/resolvers.mjs`,
    fs.readFileSync(`${process.cwd()}/dist/resolvers.module.js`),
  );
};

const copy = (name) => {
  // Copy .module.js --> .mjs for Node 13 compat.
  fs.writeFileSync(
    `${process.cwd()}/${name}/dist/${name}.mjs`,
    fs.readFileSync(`${process.cwd()}/${name}/dist/${name}.module.js`),
  );
};

copySrc();
subRepositories.forEach(copy);
