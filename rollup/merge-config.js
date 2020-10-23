import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

/**
 * Merge rollup config with base config
 * @param {*} config
 */
export default function mergeRollupConfig(config) {
  return {
    ...config,
    external: ['react-hook-form'],
    output: {
      sourcemap: true,
      exports: 'named',
      ...config.output,
    },
    plugins: [
      resolve({
        customResolveOptions: {
          moduleDirectory: config.output.dir,
        },
      }),
      terser({
        output: { comments: false },
        compress: {
          drop_console: true,
        },
      }),
      ...config.plugins,
    ],
  };
}
