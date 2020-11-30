import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import mergeConfig from './merge-config';

const dir = './dist/umd';

const config = {
  input: './src/index.ts',
  output: {
    dir,
    name: 'ReactHookFormResolvers',
    format: 'umd',
    globals: {
      'react-hook-form': 'ReactHookForm',
    },
  },
  plugins: [
    resolve(),
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: { declaration: false, module: 'ESNext' },
      },
    }),
  ],
};

export default mergeConfig(config);
