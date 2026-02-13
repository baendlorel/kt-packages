import { describe, it, expect } from 'vitest';
import { IfParser } from '../src/compiler/parser.js';

function countFunctionConstructorCalls(run: () => void): number {
  const globalObject = globalThis as unknown as { Function: FunctionConstructor };
  const OriginalFunction = globalObject.Function;
  let count = 0;

  globalObject.Function = function (...args: string[]): Function {
    count++;
    return OriginalFunction(...args);
  } as unknown as FunctionConstructor;

  try {
    run();
  } finally {
    globalObject.Function = OriginalFunction;
  }

  return count;
}

describe('IfParser expression cache option', () => {
  it('enables expression cache by default', () => {
    const compileCount = countFunctionConstructorCalls(() => {
      const parser = new IfParser({ variables: { A: true } });
      parser.evaluate('A');
      parser.evaluate('A');
      parser.evaluate('A');
    });

    expect(compileCount).toBe(1);
  });

  it('can disable expression cache explicitly', () => {
    const compileCount = countFunctionConstructorCalls(() => {
      const parser = new IfParser({ variables: { A: true }, expressionCache: false });
      parser.evaluate('A');
      parser.evaluate('A');
      parser.evaluate('A');
    });

    expect(compileCount).toBe(3);
  });
});
