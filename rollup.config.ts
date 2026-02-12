// @ts-check
import path from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { type RollupReplaceOptions } from '@rollup/plugin-replace';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';

interface CommonPackageJson {
  name: string;
  version: string;
  description: string;
  description_zh: string;
  author: {
    name: string;
    email: string;
  };
  license: string;
  repository: {
    type: string;
    url: string;
  };
}

function replaceOpts(packagePath: string | undefined) {
  if (!packagePath) {
    console.error('Error: LIB_PACKAGE_PATH environment variable is not set.');
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(path.join(packagePath, 'package.json'), 'utf-8')) as CommonPackageJson;

  function formatDateFull(dt = new Date()) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    const ss = String(dt.getSeconds()).padStart(2, '0');
    const ms = String(dt.getMilliseconds()).padStart(3, '0');
    return `${y}.${m}.${d} ${hh}:${mm}:${ss}.${ms}`;
  }

  const __KEBAB_NAME__ = pkg.name.replace('rollup-plugin-', '');
  const __VERSION__ = pkg.version;
  const __NAME__ = __KEBAB_NAME__.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());

  const __PKG_INFO__ = `## About
 * @package ${__NAME__}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @version ${pkg.version} (Last Update: ${formatDateFull()})
 * @license ${pkg.license}
 * @link ${pkg.repository.url}
 * @link https://baendlorel.github.io/ Welcome to my site!
 * @description ${pkg.description.replace(/\n/g, '\n * \n * ')}
 * @copyright Copyright (c) ${new Date().getFullYear()} ${pkg.author.name}. All rights reserved.`;

  const opts: RollupReplaceOptions = {
    preventAssignment: true,
    delimiters: ['', ''],
    values: {
      __IS_DEV__: 'false',
      __NAME__,
      __KEBAB_NAME__,
      __PKG_INFO__,
      __VERSION__,

      // global error/warn/debug
      "$throw('": `throw new Error('[${__NAME__} error] `,
      '$throw(`': `throw new Error(\`[${__NAME__} error] `,
      '$throw("': `throw new Error("[${__NAME__} error] `,
      '$warn(': `console.warn('[${__NAME__} warn]',`,
      '$error(': `console.error('[${__NAME__} error]',`,
      '$debug(': `console.debug('[${__NAME__} debug]',`,
    },
  };

  return opts;
}

const packagesDir = path.resolve('packages');
function getRollupAliases() {
  const packageDirs = readdirSync(packagesDir);
  const alias: { entries: Array<{ find: RegExp | string; replacement: string }> } = { entries: [] };
  for (const dir of packageDirs) {
    alias.entries.push({
      find: new RegExp(`^@${dir}`),
      replacement: path.join(packagesDir, dir, 'src'),
    });
  }
  return alias;
}

export default () => {
  const currentPackagePath = process.env.LIB_PACKAGE_PATH || '';

  return [
    // * Main
    {
      // todo 需要找到正确的 packagePath，如何操作?
      input: path.join(currentPackagePath, 'src', 'index.ts'),
      output: [
        {
          file: path.join(currentPackagePath, 'dist', 'index.mjs'),
          format: 'esm',
          sourcemap: false,
        },
      ],

      plugins: [
        alias(getRollupAliases()),
        replace(replaceOpts(currentPackagePath)),
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
      input: path.join(currentPackagePath, 'src', 'index.ts'),
      output: [{ file: path.join(currentPackagePath, 'dist', 'index.d.ts'), format: 'es' }],
      plugins: [alias(getRollupAliases()), replace(replaceOpts(currentPackagePath)), dts()],
    },
  ];
};
