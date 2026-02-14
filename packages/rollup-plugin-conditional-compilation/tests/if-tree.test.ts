import { describe, expect, it } from 'vitest';
import { parse } from '../src/core/parse.js';
import { loadjs } from './setup.js';

const ifCountInBody = (node: { body: Array<{ type: string }> }) => node.body.filter((x) => x.type === 'if').length;

const cond = (text: string) => text.trim();

describe('Zero dependency parser if-tree', () => {
  it('case1', () => {
    const result = parse(loadjs('case1.js'));
    expect(result.length).toBe(1);
    expect(cond(result[0].condition)).toBe('false');
    expect(result[0].elseIfs.length).toBe(0);
    expect(result[0].else).toBeUndefined();
  });

  it('case2', () => {
    const result = parse(loadjs('case2.js'));
    expect(result.length).toBe(1);
    expect(cond(result[0].condition)).toBe('VAL > 10');
    expect(result[0].elseIfs.length).toBe(1);
    expect(cond(result[0].elseIfs[0].condition)).toBe('VAL > 5');
    expect(result[0].else).toBeDefined();
  });

  it('case3', () => {
    const result = parse(loadjs('case3.js'));
    expect(result.length).toBe(0);
  });

  it('case4', () => {
    const result = parse(loadjs('case4.js'));
    expect(result.length).toBe(1);
    expect(cond(result[0].condition)).toBe('DEBUG');
  });

  it('case5', () => {
    const result = parse(loadjs('case5.js'));
    expect(result.length).toBe(5);
    expect(cond(result[0].condition)).toBe('B');
    expect(ifCountInBody(result[0])).toBe(2);
    expect(cond(result[1].condition)).toBe('true');
    expect(cond(result[2].condition)).toBe('1');
    expect(cond(result[3].condition)).toBe('2+3');
    expect(ifCountInBody(result[3])).toBe(1);
    expect(cond(result[4].condition)).toBe('A');
  });

  it('case6', () => {
    const result = parse(loadjs('case6.js'));
    expect(result.length).toBe(3);
    expect(cond(result[0].condition)).toBe('SHOULD_NOT_BE_SEEN');
    expect(cond(result[1].condition)).toBe('A && (B || C)');
    expect(ifCountInBody(result[1])).toBe(1);
    expect(cond(result[2].condition)).toBe('B');
  });

  it('case7', () => {
    const result = parse(loadjs('case7.js'));
    expect(result.length).toBe(5);
    expect(cond(result[0].condition)).toBe('X');
    expect(cond(result[1].condition)).toBe('0');
    expect(cond(result[2].condition)).toBe('Y');
    expect(ifCountInBody(result[2])).toBe(1);
    expect(cond(result[3].condition)).toBe('Z');
    expect(cond(result[4].condition)).toBe('-1');
  });

  it('case8', () => {
    const result = parse(loadjs('case8.js'));
    expect(result.length).toBe(2);
    expect(cond(result[0].condition)).toBe('(A && )');
    expect(cond(result[1].condition)).toBe('D');
  });

  it('case9', () => {
    const result = parse(loadjs('case9.js'));
    expect(result.length).toBe(1);
    expect(cond(result[0].condition)).toBe('A');
    expect(result[0].elseIfs.length).toBe(0);
    expect(result[0].else).toBeDefined();
  });

  it('case10', () => {
    const result = parse(loadjs('case10.js'));
    expect(result.length).toBe(3);
    expect(cond(result[0].condition)).toBe('A');
    expect(result[0].elseIfs.length).toBe(2);
    expect(result[0].else).toBeDefined();
    expect(cond(result[1].condition)).toBe('X');
    expect(ifCountInBody(result[1])).toBe(1);
    expect(cond(result[2].condition)).toBe('Y');
    expect(result[2].elseIfs.length).toBe(1);
    expect(result[2].else).toBeDefined();
  });

  it('case11', () => {
    const result = parse(loadjs('case11.js'));
    expect(result.length).toBe(4);
    expect(cond(result[0].condition)).toBe('false');
    expect(result[0].elseIfs.length).toBe(4);
    expect(result[0].else).toBeDefined();
    expect(cond(result[1].condition)).toBe('LEVEL1');
    expect(ifCountInBody(result[1])).toBe(1);
    expect(cond(result[2].condition)).toBe('LEVEL2');
    expect(result[2].elseIfs.length).toBe(1);
    expect(result[2].else).toBeDefined();
    expect(cond(result[3].condition)).toBe('LEVEL3');
  });

  it('case12', () => {
    const result = parse(loadjs('case12.js'));
    expect(result.length).toBe(3);
    expect(cond(result[0].condition)).toBe('A > 10');
    expect(result[0].elseIfs.length).toBe(2);
    expect(result[0].else).toBeDefined();
    expect(cond(result[1].condition)).toBe('X && Y');
    expect(result[1].elseIfs.length).toBe(2);
    expect(result[1].else).toBeDefined();
    expect(cond(result[2].condition)).toBe("TYPE === 'prod'");
    expect(result[2].elseIfs.length).toBe(2);
    expect(result[2].else).toBeDefined();
  });

  it('case13', () => {
    const result = parse(loadjs('case13.js'));
    expect(result.length).toBe(7);
    expect(cond(result[0].condition)).toBe('A');
    expect(cond(result[1].condition)).toBe('B');
    expect(result[1].elseIfs.length).toBe(1);
    expect(cond(result[2].condition)).toBe('D');
    expect(result[2].elseIfs.length).toBe(2);
    expect(result[2].else).toBeDefined();
    expect(cond(result[3].condition)).toBe('L1');
    expect(result[3].elseIfs.length).toBe(1);
    expect(ifCountInBody(result[3])).toBe(1);
    expect(cond(result[4].condition)).toBe('L2');
    expect(result[4].elseIfs.length).toBe(1);
    expect(ifCountInBody(result[4])).toBe(1);
    expect(cond(result[5].condition)).toBe('L3');
    expect(result[5].elseIfs.length).toBe(1);
    expect(ifCountInBody(result[5])).toBe(1);
    expect(cond(result[6].condition)).toBe('L4');
    expect(result[6].elseIfs.length).toBe(1);
  });

  it('case14', () => {
    const result = parse(loadjs('case14.js'));
    expect(result.length).toBe(4);
    expect(cond(result[0].condition)).toBe('VAL === 1');
    expect(result[0].elseIfs.length).toBe(4);
    expect(result[0].else).toBeDefined();
    expect(cond(result[1].condition)).toBe('OUTER');
    expect(result[1].elseIfs.length).toBe(1);
    expect(result[1].else).toBeDefined();
    expect(ifCountInBody(result[1])).toBe(2);
    expect(cond(result[2].condition)).toBe('INNER_A');
    expect(result[2].elseIfs.length).toBe(2);
    expect(result[2].else).toBeDefined();
    expect(cond(result[3].condition)).toBe('SECOND_A');
    expect(result[3].elseIfs.length).toBe(1);
    expect(result[3].else).toBeDefined();
  });

  it('case15', () => {
    expect(() => parse(loadjs('case15.js'))).toThrow(/Must start with #if, got #elseif./);
  });

  it('case16', () => {
    const result = parse(loadjs('case16.js'));
    expect(result.length).toBe(1);
    expect(cond(result[0].condition)).toBe('VALID');
    expect(result[0].elseIfs.length).toBe(1);
    expect(cond(result[0].elseIfs[0].condition)).toBe('(BROKEN &&');
    expect(result[0].else).toBeUndefined();
  });

  it('case17', () => {
    expect(() => parse(loadjs('case17.js'))).toThrow(/Unexpected #else statement found after #else/);
  });
});
