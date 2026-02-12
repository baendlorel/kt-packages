// @ts-check
import path from 'node:path';

// plugins
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';

import { replaceOpts } from './.scripts/replace-options.js';

// # common options

const tsconfig = './tsconfig.build.json';

const aliasOpts = {
  entries: [{ find: /^@/, replacement: path.resolve(import.meta.dirname, 'src') }],
};

// # main options

export default () => [
  // * Main
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: false,
      },
    ],

    plugins: [
      alias(aliasOpts),
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
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [alias(aliasOpts), replace(replaceOpts(process.env.LIB_PACKAGE_PATH)), dts()],
  },
];
