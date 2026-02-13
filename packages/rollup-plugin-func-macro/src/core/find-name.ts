import type {
  Node,
  AnonymousFunctionDeclaration,
  FunctionDeclaration,
  MethodDefinition,
  FunctionExpression,
} from 'acorn';
import { simple } from 'acorn-walk';

import type { FunctionContext, FunctionNode } from '../types/private.js';
import { between, Consts } from '../common.js';

/**
 * Find function name at a specific position in the code
 *
 * @param code raw js code
 * @param ast abstract syntax tree
 * @param position position of the identifier, used for finding the closest function name and checking the invalid usage in method name
 * @param fallback if cannot find a name, use this fallback
 * @returns function name
 */
export function findFunctionNameAtPosition(code: string, ast: Node, position: number, fallback: string): string {
  const funcs: FunctionContext[] = [];
  const add = (node: FunctionNode, name: string) =>
    funcs.push({
      name,
      start: node.start,
      end: node.end,
    });

  // console.dir(ast, { depth: 12 });

  // Collect all function contexts
  simple(ast, {
    FunctionDeclaration(node: FunctionDeclaration | AnonymousFunctionDeclaration) {
      add(node, node.id?.name ?? Consts.AnonymousFunction);
    },

    FunctionExpression(node: FunctionExpression) {
      add(node, node.id?.name ?? Consts.AnonymousFunctionExpression);
    },

    MethodDefinition(node: MethodDefinition) {
      const key = node.key;
      let name: string = Consts.AnonymousMethod;

      if (key.type === 'Identifier') {
        // Regular method: methodName() {}
        name = key.name;
      } else if (key.type === 'Literal') {
        // Dynamic method: ['methodName']() {} or ["methodName"]() {}
        name = String(key.value);
      } else {
        // Other dynamic method: ['dynamicMethod'+ getName() + "asdf"]() {}
        name = code.substring(key.start, key.end);
      }
      add(node, name);
    },
  });

  const deduped = dedup(funcs, position);
  if (deduped === null) {
    return Consts.InvalidUsingMacroInMethodName;
  }

  return findClosestName(deduped, position, fallback);
}

/**
 * # Weird Case
 * From the script below, acorn will detect **2** methods with the same `node.end`.
 * One is anonymous, one is named.
 *
 * So we only keep the named one.
 *
 * ```ts
 * class TestClass {
 *   ['dynamicMethod']() {
 *     console.log("dynamicMethod");
 *   }
 * };
 * ```
 */
function dedup(funcs: FunctionContext[], position: number): FunctionContext[] | null {
  const filtered: FunctionContext[] = [];
  for (let i = 0; i < funcs.length; i++) {
    const func = funcs[i];

    const index = filtered.findIndex((f) => f.end === func.end);
    if (index === -1) {
      filtered.push(func);
      continue;
    }

    /**
     * & If `position` appears between this 2 nodes's `start`, this is the case that using `__func__` in the method name
     * ! This is the invalid using
     * ```ts
     * class TestClass {
     *   ['dynamicMethod'+ __func__]() {
     *   }
     * }
     * ```
     */
    if (between(position, func.start, filtered[index].start)) {
      return null;
    }

    if (filtered[index].start >= func.start) {
      filtered[index] = func;
    }
  }
  return filtered;
}

function findClosestName(funcs: FunctionContext[], position: number, fallback: string): string {
  // Find the innermost function that contains the position
  // Skip arrow functions by only considering our collected contexts
  // & Find the closest function name
  let name = fallback;
  let maxStart = -1;
  for (let i = 0; i < funcs.length; i++) {
    const func = funcs[i];
    if (position < func.start || func.end < position) {
      continue;
    }

    // Better to be greater than maxStart
    if (func.start > maxStart) {
      name = func.name;
      maxStart = func.start;
    }
  }
  return name;
}
