import * as acorn from 'acorn';
import type { Dirv } from '../compiler/consts.ts';

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
  ecmaVersion: acorn.ecmaVersion;
}

export interface IfBlock {
  dirv: Dirv;
  condition: boolean | null;
  ifStart: number;
  ifEnd: number;
  endifStart: number;
  endifEnd: number;
  children: IfBlock[];
}

export interface DirvBlock {
  dirv: Dirv;

  /**
   * When `dirv` is `#endif`, `condition` is meaningless (always `false`).
   */
  condition: boolean;

  start: number;

  end: number;
}

export interface CompileResult {
  code: string;
  keptRanges: CodeRange[];
}

export interface SourceMapOptions {
  filename?: string;
}

export interface CodeRange {
  start: number;
  end: number;
}

export interface LineMapping {
  originalLine: number;
  originalColumn: number;
  generatedLine: number;
  generatedColumn: number;
}
