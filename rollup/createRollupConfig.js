import ts from 'typescript';
import path from 'path';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import { safePackageName } from './safePackageName';
import { pascalcase } from './pascalcase';
import pkg from '../package.json';

export function createRollupConfig(options) {
  const name = options.name || safePackageName(pkg.name);
  const umdName = options.umdName || pascalcase(safePackageName(pkg.name));
  const shouldMinify = options.minify || options.env === 'production';
  const tsconfigPath = options.tsconfig || 'tsconfig.json';
  const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './',
  ).options;

  const outputName = [
    path.join(tsCompilerOptions.outDir, name),
    options.formatName || options.format,
    options.env,
    shouldMinify ? 'min' : '',
    'js',
  ]
    .filter(Boolean)
    .join('.');

  return {
    input: options.input,
    output: {
      file: outputName,
      format: options.format,
      name: umdName,
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-hook-form': 'ReactHookForm',
      },
      exports: 'named',
    },
    plugins: [
      external({
        includeDependencies: options.format !== 'umd',
      }),
      json(),
      typescript({
        tsconfig: options.tsconfig,
        clean: true,
      }),
      resolve(),
      options.format === 'umd' &&
        commonjs({
          include: /\/node_modules\//,
        }),
      options.env !== undefined &&
        replace({
          'process.env.NODE_ENV': JSON.stringify(options.env),
        }),
      sourcemaps(),
      shouldMinify &&
        terser({
          output: { comments: false },
          compress: {
            drop_console: true,
          },
        }),
      options.plugins,
    ],
  };
}
