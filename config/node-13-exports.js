// Original source: https://github.com/preactjs/preact/blob/master/config/node-13-exports.js
const fs = require('fs');

const subRepositories = [
  'zod',
  'joi',
  'vest',
  'yup',
  'superstruct',
  'class-validator',
];
const snakeCaseToCamelCase = (str) =>
  str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', ''));

const copySrc = () => {
  // Copy .module.js --> .mjs for Node 13 compat.
  fs.writeFileSync(
    `${process.cwd()}/dist/resolvers.mjs`,
    fs.readFileSync(`${process.cwd()}/dist/resolvers.module.js`),
  );
};

const copy = (name) => {
  // Copy .module.js --> .mjs for Node 13 compat.
  const filename = name.includes('-') ? snakeCaseToCamelCase(name) : name;
  fs.writeFileSync(
    `${process.cwd()}/${name}/dist/${filename}.mjs`,
    fs.readFileSync(`${process.cwd()}/${name}/dist/${name}.module.js`),
  );
};

copySrc();
subRepositories.forEach(copy);
