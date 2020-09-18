import path from 'path';
import ts from 'typescript';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

export function createRollupConfig(options, callback) {
  const {
    env,
    umdName,
    format,
    formatName,
    tsconfig = 'tsconfig.json',
    input,
  } = options;
  const shouldMinify = env === 'production';

  const tsconfigPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    tsconfig,
  );
  const tsconfigJson = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const tscompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJson.config,
    ts.sys,
    './',
  ).options;

  const dir = path.join(tscompilerOptions.outDir, formatName || format);
  const isUMDFormat = format === 'umd';

  const entryFileNames = ['[name]', env, shouldMinify ? 'min' : '', 'js']
    .filter(Boolean)
    .join('.');

  const config = {
    input,
    preserveModules: !isUMDFormat,
    output: {
      dir,
      format,
      name: umdName,
      sourcemap: true,
      globals: {
        'react-hook-form': 'ReactHookForm',
      },
      exports: 'named',
      entryFileNames,
    },
    plugins: [
      external({
        includeDependencies: !isUMDFormat,
      }),
      json(),
      typescript({
        tsconfig: tsconfigPath,
        clean: true,
      }),
      resolve({
        customResolveOptions: {
          moduleDirectory: dir,
        },
      }),
      isUMDFormat &&
        commonjs({
          include: /\/node_modules\//,
        }),
      env !== undefined &&
        replace({
          'process.env.NODE_ENV': JSON.stringify(env),
        }),
      sourcemaps(),
      shouldMinify &&
        terser({
          output: { comments: false },
          compress: {
            drop_console: true,
          },
        }),
    ].filter(Boolean),
  };

  return callback ? callback(config) : config;
}
