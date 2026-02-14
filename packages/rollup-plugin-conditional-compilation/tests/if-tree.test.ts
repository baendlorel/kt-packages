import { describe, it, expect } from 'vitest';

describe('conditionalCompilation options', () => {
  it('supports disabling expression cache', () => {
    expect(() =>
      conditionalCompilation({
        variables: { FLAG: true },
        expressionCache: false,
        sourceType: 'script',
        ecmaVersion: 'latest',
      }),
    ).not.toThrow();
  });

  it('validates expressionCache option type', () => {
    expect(() =>
      conditionalCompilation({
        variables: {},
        expressionCache: 'yes' as unknown as boolean,
      }),
    ).toThrow('expressionCache');
  });
});
