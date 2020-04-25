import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export function getConfig({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: `dist/${pkg.name}.js`,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: `dist/${pkg.name}.es.js`,
      format: 'esm',
    },
  ],
} = {}) {
  return {
    input: 'src/index.tsx',
    external: [
      'react',
      'react-dom',
      'react-hook-form',
      'react-simple-animate',
      'lodash/get',
      'styled-components',
      'lodash/isUndefined',
      'lodash/isObject',
    ],
    plugins: [
      typescript({
        tsconfig,
        clean: true,
      }),
    ],
    output,
  };
}

export default getConfig();
