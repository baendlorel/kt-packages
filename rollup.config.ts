// @ts-check
import path from 'node:path';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';

import { replaceOpts } from './.scripts/replace-options.js';
import { getRollupAliases } from './.scripts/aliases.js';

export default () => {
  const packagePath = process.env.LIB_PACKAGE_PATH as string;
  return [
    // * Main
    {
      input: path.join(packagePath, 'src', 'index.ts'),
      output: [
        {
          file: path.join(packagePath, 'dist', 'index.mjs'),
          format: 'esm',
          sourcemap: false,
        },
      ],

      plugins: [
        alias(getRollupAliases()),
        replace(replaceOpts(process.env.LIB_PACKAGE_PATH)),
        resolve(),
        commonjs(),
        typescript(),
        terser({
          format: {
            comments: false, // remove comments
          },
          compress: {
            drop_console: true,
            dead_code: true, // ✅ Safe: remove dead code
            evaluate: true, // ✅ Safe: evaluate constant expressions
          },
          mangle: {
            properties: {
              regex: /^_/, // only mangle properties starting with '_'
            },
          },
        }),
      ],
      external: [],
    },
    // * Declarations
    {
      input: path.join(packagePath, 'src', 'index.ts'),
      output: [{ file: path.join(packagePath, 'dist', 'index.d.ts'), format: 'es' }],
      plugins: [alias(getRollupAliases()), replace(replaceOpts(process.env.LIB_PACKAGE_PATH)), dts()],
    },
  ];
};
