import { createRollupConfig } from './rollup/createRollupConfig';

const name = 'index';
const umdName = 'ReactHookFormResolvers';
const options = [
  {
    name,
    umdName,
    format: 'cjs',
  },
  {
    name,
    umdName,
    format: 'cjs',
  },
  {
    name,
    umdName,
    format: 'esm',
  },
  {
    name,
    umdName,
    format: 'umd',
  },
  {
    name,
    umdName,
    format: 'umd',
  },
  {
    name,
    umdName,
    format: 'esm',
    formatName: 'ie11',
    tsconfig: 'tsconfig.ie11.json',
  },
];

export default options.map((option) => createRollupConfig(option));
