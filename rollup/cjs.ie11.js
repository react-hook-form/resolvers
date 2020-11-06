import glob from 'matched';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import mergeConfig from './merge-config';

const dir = './dist/ie11';

const config = {
  input: glob.sync(['src/**/*.ts', '!src/index.ts', '!src/**/*.test.ts']),
  preserveModules: true,
  output: {
    dir,
    format: 'cjs',
    paths: {
      'react-hook-form': 'react-hook-form/dist/index.ie11',
    },
  },
  plugins: [
    commonjs(),
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          module: 'ESNext',
          downlevelIteration: true,
          target: 'es5',
        },
      },
    }),
  ],
};

export default mergeConfig(config);
