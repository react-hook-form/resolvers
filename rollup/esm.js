import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import mergeConfig from './merge-config';

const dir = './dist/esm';

const config = {
  input: './src/index.ts',
  output: {
    dir,
    format: 'esm',
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
