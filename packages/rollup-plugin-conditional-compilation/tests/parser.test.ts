import { describe, it, expect } from 'vitest';
import { IfParser } from '../src/compiler/parser.js';
import { loadjs } from './setup.js';

describe('IfParser basic behaviors', () => {
  const opts = { variables: { DEBUG: true, VAL: 7 } };
  const parser = new IfParser(opts);

  it('evaluate should compute expressions using provided variables', () => {
    expect(parser.evaluate('DEBUG')).toBe(true);
    expect(parser.evaluate('VAL > 5')).toBe(true);
    expect(parser.evaluate('!!DEBUG')).toBe(true);
  });

  it('evaluate should throw on invalid expressions (unknown identifiers)', () => {
    expect(() => parser.evaluate('UNKNOWN_VAR + 1')).toThrow();
  });

  it('proceed should return null for files without recognized directives', () => {
    const code = loadjs('case3.js');
    expect(() => parser.proceed(code)).not.toThrow();
    const result = parser.proceed(code);
    expect(result).toBeNull();
  });

  it('proceed should run on a file with directives without throwing (basic smoke test)', () => {
    const code = loadjs('case2.js');
    expect(() => parser.proceed(code)).not.toThrow();
  });

  it('should short-circuit #elif evaluation after a truthy #if', () => {
    const code = `// #if true
console.log('taken');
// #elif UNKNOWN_VAR + 1
console.log('skipped');
// #endif
`;
    const result = parser.proceed(code);
    expect(result?.code).toContain("console.log('taken');");
    expect(result?.code).not.toContain("console.log('skipped');");
  });

  it('should skip evaluating nested conditions inside an inactive parent branch', () => {
    let effectCount = 0;
    const code = `// #if OUTER
// #if SIDE_EFFECT()
console.log('inner');
// #endif
// #endif
`;
    const nestedParser = new IfParser({
      variables: {
        OUTER: false,
        SIDE_EFFECT: () => {
          effectCount++;
          return true;
        },
      },
    });

    const result = nestedParser.proceed(code);
    expect(effectCount).toBe(0);
    expect(result?.code ?? '').not.toContain("console.log('inner');");
  });
});
