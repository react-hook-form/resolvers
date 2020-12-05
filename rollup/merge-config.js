import { terser } from 'rollup-plugin-terser';

/**
 * Merge rollup config with base config
 * @param {*} config
 */
export default function mergeRollupConfig(config) {
  return {
    ...config,
    external: ['react-hook-form'].concat(config.external || []),
    output: {
      sourcemap: true,
      exports: 'named',
      ...config.output,
    },
    plugins: [
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
