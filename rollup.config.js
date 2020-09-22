import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const dir = './dist/umd';

export default {
  input: './src/index.ts',
  output: {
    dir,
    name: 'ReactHookFormResolvers',
    format: 'umd',
    sourcemap: true,
    globals: {
      'react-hook-form': 'ReactHookForm',
    },
    exports: 'named',
  },
  external: ['react-hook-form'],
  plugins: [
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: { declaration: false, module: 'ESNext' },
      },
    }),
    resolve({
      customResolveOptions: {
        moduleDirectory: dir,
      },
    }),
    commonjs({
      include: /\/node_modules\//,
    }),
    terser({
      output: { comments: false },
      compress: {
        drop_console: true,
      },
    }),
  ],
};
