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

  /**
   * Cache compiled expression functions by expression string.
   * - default: true
   */
  expressionCache: boolean;
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
  expr: string;

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

export interface CodeLine {
  content: string;
  start: number;
  end: number;
}
