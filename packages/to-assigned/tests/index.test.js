import { describe, it, expect } from 'vitest';
import { toAssigned } from '../dist/index.mjs';

describe('dist: toAssigned', () => {
  it('returns an empty object when no arguments are given', () => {
    expect(toAssigned()).toEqual({});
  });
});
