import type { ecmaVersion } from 'acorn';

export interface RollupConditionalCompilationOptions {
  /**
   * Variables to be used in the expressions `#if` or `#elif`
   */
  variables: Record<string, unknown>;

  /**
   * Will be passed to Acorn
   * - default: 'module'
   */
  sourceType: 'script' | 'module';

  /**
   * Will be passed to Acorn
   * - default: 'latest'
   */
  ecmaVersion: ecmaVersion;

  /**
   * Cache compiled expression functions by expression string.
   * - default: true
   */
  expressionCache: boolean;
}

declare module '*.js?raw' {
  const content: string;
  export default content;
}
