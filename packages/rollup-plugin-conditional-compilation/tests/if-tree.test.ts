import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from '../src/core/parse.js';
import type { IfNode, IfStatement } from '../src/types/if.js';
import { loadjs } from './setup.js';

interface ElseIfTree {
  condition: string;
  body: IfTree[];
}

interface IfTree {
  condition: string;
  body: IfTree[];
  elseIfs: ElseIfTree[];
  hasElse: boolean;
  elseBody: IfTree[];
}

interface ValidCase {
  file: `case${number}.js`;
  tree: IfTree[];
}

interface ErrorCase {
  file: `case${number}.js`;
  throws: RegExp;
}

type CaseSpec = ValidCase | ErrorCase;

const elseif = (condition: string, body: IfTree[] = []): ElseIfTree => ({ condition, body });

const ifTree = (
  condition: string,
  options?: {
    body?: IfTree[];
    elseIfs?: ElseIfTree[];
    hasElse?: boolean;
    elseBody?: IfTree[];
  },
): IfTree => ({
  condition,
  body: options?.body ?? [],
  elseIfs: options?.elseIfs ?? [],
  hasElse: options?.hasElse ?? false,
  elseBody: options?.elseBody ?? [],
});

const CASES: CaseSpec[] = [
  { file: 'case1.js', tree: [ifTree('false')] },
  { file: 'case2.js', tree: [ifTree('VAL > 10', { elseIfs: [elseif('VAL > 5')], hasElse: true })] },
  { file: 'case3.js', tree: [] },
  { file: 'case4.js', tree: [ifTree('DEBUG')] },
  {
    file: 'case5.js',
    tree: [ifTree('B', { body: [ifTree('true'), ifTree('1')] }), ifTree('2+3', { body: [ifTree('A')] })],
  },
  { file: 'case6.js', tree: [ifTree('A && (B || C)', { body: [ifTree('B')] })] },
  { file: 'case7.js', tree: [ifTree('X'), ifTree('0'), ifTree('Y', { body: [ifTree('Z')] }), ifTree('-1')] },
  { file: 'case8.js', tree: [ifTree('(A && )'), ifTree('D')] },
  { file: 'case9.js', tree: [ifTree('A', { hasElse: true })] },
  {
    file: 'case10.js',
    tree: [
      ifTree('A', { elseIfs: [elseif('B'), elseif('C')], hasElse: true }),
      ifTree('X', { body: [ifTree('Y', { elseIfs: [elseif('Z')], hasElse: true })] }),
    ],
  },
  {
    file: 'case11.js',
    tree: [
      ifTree('false', {
        elseIfs: [elseif('false'), elseif('false'), elseif('true'), elseif('true')],
        hasElse: true,
      }),
      ifTree('LEVEL1', {
        body: [
          ifTree('LEVEL2', {
            elseIfs: [elseif('LEVEL2_ALT', [ifTree('LEVEL3')])],
            hasElse: true,
          }),
        ],
      }),
    ],
  },
  {
    file: 'case12.js',
    tree: [
      ifTree('A > 10', { elseIfs: [elseif('A > 5'), elseif('A > 0')], hasElse: true }),
      ifTree('X && Y', { elseIfs: [elseif('X || Y'), elseif('!X && !Y')], hasElse: true }),
      ifTree("TYPE === 'prod'", { elseIfs: [elseif("TYPE === 'dev'"), elseif("TYPE === 'test'")], hasElse: true }),
    ],
  },
  {
    file: 'case13.js',
    tree: [
      ifTree('A'),
      ifTree('B', { elseIfs: [elseif('C')] }),
      ifTree('D', { elseIfs: [elseif('E'), elseif('F')], hasElse: true }),
      ifTree('L1', {
        body: [
          ifTree('L2', {
            body: [
              ifTree('L3', {
                body: [ifTree('L4', { elseIfs: [elseif('L4_ALT')] })],
                elseIfs: [elseif('L3_ALT')],
              }),
            ],
            elseIfs: [elseif('L2_ALT')],
          }),
        ],
        elseIfs: [elseif('L1_ALT')],
      }),
    ],
  },
  {
    file: 'case14.js',
    tree: [
      ifTree('VAL === 1', {
        elseIfs: [elseif('VAL === 2'), elseif('VAL === 3'), elseif('VAL === 4'), elseif('VAL === 5')],
        hasElse: true,
      }),
      ifTree('OUTER', {
        body: [
          ifTree('INNER_A', { elseIfs: [elseif('INNER_B'), elseif('INNER_C')], hasElse: true }),
          ifTree('SECOND_A', { elseIfs: [elseif('SECOND_B')], hasElse: true }),
        ],
        elseIfs: [elseif('OUTER_ALT')],
        hasElse: true,
      }),
    ],
  },
  { file: 'case15.js', throws: /Must start with #if|Unexpected #elseif|#elif is no longer supported/ },
  { file: 'case16.js', tree: [ifTree('VALID', { elseIfs: [elseif('(BROKEN &&')] })] },
  { file: 'case17.js', throws: /Unexpected #else statement found after #else/ },
];

const isIf = (node: IfStatement): node is IfNode => node.type === 'if';

const directChildren = (node: IfNode): IfNode[] => {
  const bodyChildren = node.body.filter(isIf);
  const elseIfChildren = node.elseIfs.flatMap((item) => item.body.filter(isIf));
  const elseChildren = node.else ? node.else.body.filter(isIf) : [];
  return [...bodyChildren, ...elseIfChildren, ...elseChildren];
};

const rootIfNodes = (nodes: IfNode[]): IfNode[] => {
  const children = new Set<IfNode>();
  for (let i = 0; i < nodes.length; i++) {
    for (const child of directChildren(nodes[i])) {
      children.add(child);
    }
  }

  return nodes.filter((node) => !children.has(node));
};

const normalize = (node: IfNode): IfTree =>
  ifTree(node.condition.trim(), {
    body: node.body.filter(isIf).map(normalize),
    elseIfs: node.elseIfs.map((item) => elseif(item.condition.trim(), item.body.filter(isIf).map(normalize))),
    hasElse: Boolean(node.else),
    elseBody: node.else ? node.else.body.filter(isIf).map(normalize) : [],
  });

const normalizeRoots = (nodes: IfNode[]): IfTree[] => rootIfNodes(nodes).map(normalize);

const countNodes = (nodes: IfTree[]): number => {
  let total = 0;
  for (let i = 0; i < nodes.length; i++) {
    total += 1;
    total += countNodes(nodes[i].body);
    total += countNodes(nodes[i].elseBody);
    for (let j = 0; j < nodes[i].elseIfs.length; j++) {
      total += countNodes(nodes[i].elseIfs[j].body);
    }
  }

  return total;
};

const assertLinks = (nodes: IfNode[]) => {
  const visited = new Set<IfNode>();

  const walk = (node: IfNode, parent?: IfNode): void => {
    expect(visited.has(node)).toBe(false);
    visited.add(node);
    expect(node.endIf.type).toBe('endif');
    expect(node.endIf.belong).toBe(node);
    expect(node.start).toBeLessThan(node.end);
    expect(node.end).toBeLessThanOrEqual(node.endIf.start);

    if (parent) {
      expect(node.start).toBeGreaterThan(parent.start);
      expect(node.endIf.end).toBeLessThan(parent.endIf.end);
    }

    for (let i = 0; i < node.elseIfs.length; i++) {
      const branch = node.elseIfs[i];
      expect(branch.belong).toBe(node);
      expect(branch.start).toBeLessThan(branch.end);
      for (const child of branch.body.filter(isIf)) {
        walk(child, node);
      }
    }

    if (node.else) {
      expect(node.else.belong).toBe(node);
      expect(node.else.start).toBeLessThan(node.else.end);
      for (const child of node.else.body.filter(isIf)) {
        walk(child, node);
      }
    }

    for (const child of node.body.filter(isIf)) {
      walk(child, node);
    }
  };

  for (const root of rootIfNodes(nodes)) {
    walk(root);
  }

  expect(visited.size).toBe(nodes.length);
};

describe('Zero dependency parser if-tree', () => {
  it('covers every caseX.js fixture', () => {
    const files = readdirSync(join(import.meta.dirname, '..', '.mock'))
      .filter((name) => /^case\d+\.js$/.test(name))
      .sort((a, b) => Number(a.slice(4, -3)) - Number(b.slice(4, -3)));
    expect(CASES.map((item) => item.file)).toEqual(files);
  });

  for (const spec of CASES) {
    if ('throws' in spec) {
      it(`${spec.file} should throw`, () => {
        expect(() => parse(loadjs(spec.file))).toThrow(spec.throws);
      });
      continue;
    }

    it(`${spec.file} should generate the expected ifnode tree`, () => {
      const result = parse(loadjs(spec.file));
      expect(result.length).toBe(countNodes(spec.tree));
      assertLinks(result);
      expect(normalizeRoots(result)).toEqual(spec.tree);
    });
  }
});
