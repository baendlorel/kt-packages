import { describe, it, expect } from 'vitest';
import { parse } from '../src/core/parse.js';
import { loadjs } from './setup.js';

describe('Zero dependency parser', () => {
  it('case2 simple if elseif else endif', () => {
    const result = parse(loadjs('case2.js'));
    console.log('result', result);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('if');
    expect(result[0].condition).toContain('VAL > 10');
    expect(result[0].else).toBeDefined();
    expect(result[0].elseIfs.length).toBe(1);
  });
});
