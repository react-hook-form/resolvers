import typescript from 'rollup-plugin-typescript2';
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
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: { declaration: false, module: 'ESNext' },
      },
    }),
  ],
};

export default mergeConfig(config);
