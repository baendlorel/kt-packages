import type { FuncMacroOptions } from '../global.js';
import { Identifier } from '../common.js';

export function normalize(options: Partial<FuncMacroOptions> | undefined): FuncMacroOptions {
  const {
    identifier = Identifier.Func,
    fileIdentifier = Identifier.File,
    include = ['**/*.js', '**/*.ts'],
    exclude = ['node_modules/**'],
    fallback = identifier,
    stringReplace = true,
  } = Object(options);

  // [FATAL]

  if (typeof identifier !== 'string' || !identifier) {
    throw new TypeError('__NAME__: identifier must be a non-empty string');
  }

  if (typeof fileIdentifier !== 'string' || !fileIdentifier) {
    throw new TypeError('__NAME__: fileIdentifier must be a non-empty string or undefined');
  }

  if (!Array.isArray(include) || include.some((v) => typeof v !== 'string')) {
    throw new TypeError('__NAME__: include must be string[]');
  }

  if (!Array.isArray(exclude) || exclude.some((v) => typeof v !== 'string')) {
    throw new TypeError('__NAME__: exclude must be string[]');
  }

  if (typeof fallback !== 'string') {
    throw new TypeError('__NAME__: fallback must be a string');
  }

  if (typeof stringReplace !== 'boolean') {
    throw new TypeError('__NAME__: stringReplace must be a boolean');
  }

  // [WARN]

  if (identifier.length < 4) {
    console.warn(
      `__NAME__: Warning: using a very short identifier('${identifier}') may lead to unexpected replacements.`,
    );
  }

  if (fileIdentifier.length < 4) {
    console.warn(
      `__NAME__: Warning: using a very short fileIdentifier('${fileIdentifier}') may lead to unexpected replacements.`,
    );
  }

  return {
    identifier,
    fileIdentifier,
    include,
    exclude,
    fallback,
    stringReplace,
  };
}
