import glob from 'matched';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import mergeConfig from './merge-config';

const dir = './dist/ie11';

const config = {
  input: glob.sync(['src/**/*.ts', '!src/index.ts', '!src/**/*.test.ts']),
  preserveModules: true,
  external: ['superstruct'],
  output: {
    dir,
    format: 'cjs',
    paths: {
      'react-hook-form': 'react-hook-form/dist/index.ie11',
    },
  },
  plugins: [
    resolve({
      moduleDirectories: [dir],
    }),
    commonjs(),
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          module: 'ESNext',
          downlevelIteration: true,
          target: 'es5',
        },
      },
    }),
  ],
};

export default mergeConfig(config);
