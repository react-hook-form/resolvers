import path from 'path';
import ts from 'typescript';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import multiEntry from '@rollup/plugin-multi-entry';

export function createRollupConfig(options, callback) {
  const { umdName, format, formatName, tsconfig = 'tsconfig.json' } = options;

  const tsconfigPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    tsconfig,
  );
  const tsconfigJsonFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const tsconfigJson = ts.parseJsonConfigFileContent(
    tsconfigJsonFile.config,
    ts.sys,
    './',
  );

  const isUMDFormat = format === 'umd';
  const isESMFormat = format === 'esm' && !formatName; // Exclude IE
  const include = tsconfigJson.raw.include[0];
  const dir = path.join(
    tsconfigJson.options.outDir,
    isESMFormat ? '.' : formatName || format,
  );

  const config = {
    input: isUMDFormat
      ? `${include}/index.ts`
      : {
          include: [`${include}/**/*.ts`],
          exclude: tsconfigJson.raw.exclude,
          entryFileName: '[name].js',
        },
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
    },
    plugins: [
      !isUMDFormat && multiEntry(),
      external({
        includeDependencies: !isUMDFormat,
      }),
      json(),
      typescript({
        tsconfig: tsconfigPath,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: isESMFormat,
          },
        },
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
      sourcemaps(),
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
