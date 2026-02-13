import { describe, it, expect } from 'vitest';
import { IfParser } from '../src/compiler/parser.js';
import { codeOf, loadjs } from './setup.js';

describe('IfParser final compile', () => {
  it('evaluate should compute expressions using provided variables', () => {
    const code = loadjs('case5.js');
    const parser = new IfParser({
      variables: { A: true, B: false, C: true },
      sourceType: 'script',
      ecmaVersion: 'latest',
    });

    const dirvBlocks = parser.toDirvBlocks(code);
    const ifBlocks = parser.toIfBlocks(dirvBlocks);
    const result = parser.compile(code, ifBlocks);
    expect(codeOf(result)).not.toContain("console.log('1');");
    expect(codeOf(result)).not.toContain("console.log('2');");
    expect(codeOf(result)).not.toContain("console.log('3');");
    expect(codeOf(result)).not.toContain("console.log('4');");
    expect(codeOf(result)).not.toContain('#if'); // directive comments removed
    expect(codeOf(result)).not.toContain('#endif'); // directive comments removed
    expect(codeOf(result)).toContain("console.log('5');");
    expect(codeOf(result)).toContain("console.log('6');");
    expect(codeOf(result)).toContain("console.log('7');");
  });

  it('complex case6 should ignore block-commented directives and handle nested indented directives', () => {
    const code = loadjs('case6.js');
    const parser = new IfParser({
      variables: { A: true, B: true, C: false },
      sourceType: 'script',
      ecmaVersion: 'latest',
    });

    const dirvBlocks = parser.toDirvBlocks(code);
    // should ignore directives inside block comments and string literals
    // case6 contains 4 visible directive comments (two outer indented #if, inner #if/#endif)
    expect(dirvBlocks.length).toBe(4);

    const ifBlocks = parser.toIfBlocks(dirvBlocks);
    const result = parser.compile(code, ifBlocks);

    // since A is true and B is true in opts, inner code should remain
    expect(codeOf(result)).toContain("console.log('A-start');".replace(/'/g, "'"));
    expect(codeOf(result)).toContain("console.log('B-inner');");
    expect(codeOf(result)).toContain("console.log('A-end');");
    // ensure the block-commented 'inside block comment' is still present because it was in block comment
    expect(codeOf(result)).toContain('inside block comment');
  });

  it('case7 should handle numeric expressions and adjacent directives properly', () => {
    const code = loadjs('case7.js');
    // X falsy, Y true, Z true to exercise various branches
    const parser = new IfParser({ variables: { X: 0, Y: true, Z: true }, sourceType: 'script', ecmaVersion: 'latest' });

    const dirvBlocks = parser.toDirvBlocks(code);
    expect(dirvBlocks.length).toBeGreaterThanOrEqual(6);

    const ifBlocks = parser.toIfBlocks(dirvBlocks);
    const result = parser.compile(code, ifBlocks);

    // X is falsy -> x-true should be removed; numeric -1 is truthy -> 'neg' should exist
    expect(codeOf(result)).not.toContain('x-true');
    expect(codeOf(result)).toContain('y-and-z');
    expect(codeOf(result)).toContain('neg');
  });

  it('case8 malformed expr cause evaluate to throw', () => {
    const code = loadjs('case8.js');
    const opts = { variables: { D: true, A: true } } as any;
    const parser = new IfParser(opts);

    expect(() => parser.proceed(code)).toThrow();
  });

  it('case9 handle else', () => {
    const code = loadjs('case9.js');
    const parser1 = new IfParser({ variables: { A: true }, sourceType: 'script', ecmaVersion: 'latest' });
    const result1 = parser1.proceed(code);
    expect(codeOf(result1)).toContain("console.log('1');");

    const parser2 = new IfParser({ variables: { A: false }, sourceType: 'script', ecmaVersion: 'latest' });
    const result2 = parser2.proceed(code);
    expect(codeOf(result2)).toContain("console.log('2');");
  });
});
