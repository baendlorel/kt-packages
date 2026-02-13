import { describe, it, expect } from 'vitest';
import { IfParser } from '../src/compiler/parser.js';
import { createSourceMap } from '../src/compiler/sourcemap.js';
import { loadjs } from './setup.js';

describe('createSourceMap', () => {
  it('generates a valid map from kept ranges', () => {
    const code = loadjs('case9.js');
    const parser = new IfParser({
      variables: { A: true },
      sourceType: 'script',
      ecmaVersion: 'latest',
    });

    const result = parser.proceed(code);
    expect(result).not.toBeNull();

    const map = createSourceMap(code, result!.keptRanges, { filename: 'case9.js' });
    expect(map.version).toBe(3);
    expect(map.file).toBe('case9.js');
    expect(map.sources).toEqual(['case9.js']);
    expect(map.sourcesContent?.[0]).toBe(code);
    expect(typeof map.mappings).toBe('string');
    expect(map.mappings.length).toBeGreaterThan(0);
  });

  it('handles fully removed output without throwing', () => {
    const code = `// #if false
console.log('removed');
// #endif
`;
    const parser = new IfParser({
      variables: {},
      sourceType: 'script',
      ecmaVersion: 'latest',
    });

    const result = parser.proceed(code);
    expect(result).not.toBeNull();
    expect(result!.code.trim()).toBe('');

    const map = createSourceMap(code, result!.keptRanges, { filename: 'empty.js' });
    expect(map.version).toBe(3);
    expect(map.file).toBe('empty.js');
    expect(map.sources).toEqual(['empty.js']);
  });
});
