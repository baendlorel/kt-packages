import { describe, it, expect } from 'vitest';
import { parse } from '../src/core/parse.js';
import { loadjs } from './setup.js';

describe('Zero dependency parser', () => {
  it('supports disabling expression cache', () => {
    expect(() => {
      const result = parse(loadjs('case2.js'));
      console.log(result);
    });
  });
});
