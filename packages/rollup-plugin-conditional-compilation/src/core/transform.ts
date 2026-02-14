import MagicString from 'magic-string';
import { IfNode } from '../types/if.js';

export function apply(code: string, nodes: IfNode[], values: Record<string, any>): string {
  const initializeVarsCode = initializeVars(values);

  return '';
}

function initializeVars(variables: Record<string, any>): string {
  const list: string[] = [];
  for (const k in variables) {
    list.push(`${k} = ${JSON.stringify(variables[k])}`);
  }
  return `var ${list.join(',')};`;
}

function evaluate(condition: string, initializeVarsCode: string): boolean {
  const func = new Function(initializeVarsCode + `return ${condition};`);
  return Boolean(func());
}
