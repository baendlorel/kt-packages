import { basename } from 'node:path';
import { Plugin } from 'rollup';
import { createFilter } from '@rollup/pluginutils';

import type { FuncMacroOptions } from './global.js';
import { normalize } from './core/normalize.js';
import { replaceIdentifiers } from './core/replace.js';
import { findFunctionNameAtPosition } from './core/find-name.js';

/**
 * ## Usage
 * use `funcMacro()` in your Rollup configuration to enable the plugin.
 *
 * detailed infomation can be found in the type definition of `options`.
 *
 * __PKG_INFO__
 */
export function funcMacro(options?: Partial<FuncMacroOptions>): Plugin {
  const opts = normalize(options);
  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: '__KEBAB_NAME__',
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const filename = basename(id);
      let changed = false;
      let result = code;

      if (opts.identifier !== null) {
        if (code.includes(opts.identifier)) {
          const transformed = replaceIdentifiers({
            code: result,
            identifier: opts.identifier,
            nameGetter: findFunctionNameAtPosition,
            fallback: opts.fallback,
            stringReplace: opts.stringReplace,
          });

          if (transformed !== null) {
            result = transformed;
            changed = true;
          }
        }
      }

      if (opts.fileIdentifier !== null) {
        if (code.includes(opts.fileIdentifier)) {
          const transformed = replaceIdentifiers({
            code: result,
            identifier: opts.fileIdentifier,
            nameGetter: () => filename,
            fallback: opts.fallback,
            stringReplace: opts.stringReplace,
          });

          if (transformed !== null) {
            result = transformed;
            changed = true;
          }
        }
      }

      return changed ? { code: result, map: null } : null;
    },
  };
}
