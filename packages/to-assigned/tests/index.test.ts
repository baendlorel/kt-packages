import { describe, it, expect } from 'vitest';
import { toAssigned } from '../src';

describe('toAssigned', () => {
  it('returns an empty object when no arguments are given', () => {
    expect(toAssigned()).toEqual({});
  });

  it('copies properties from a single object', () => {
    const obj = { a: 1, b: 2 };
    expect(toAssigned(obj)).toEqual({ a: 1, b: 2 });
  });

  it('merges multiple objects, later properties overwrite earlier ones', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 3, z: 4 };
    expect(toAssigned(a, b)).toEqual({ x: 1, y: 3, z: 4 });
  });

  it('ignores non-object arguments', () => {
    expect(toAssigned({ a: 1 }, null, undefined, 123, 'str', false)).toEqual({ a: 1 });
  });

  it('copies only enumerable properties', () => {
    const obj = {} as any;
    Object.defineProperty(obj, 'hidden', { value: 42, enumerable: false });
    obj.visible = 7;
    expect(toAssigned(obj)).toEqual({ visible: 7 });
  });

  it('copies symbol keys if enumerable', () => {
    const sym = Symbol('s');
    const obj = { [sym]: 1 };
    expect(toAssigned(obj)).toEqual({ [sym]: 1 });
  });

  it('does not mutate source objects', () => {
    const a = { x: 1 };
    const b = { y: 2 };
    toAssigned(a, b);
    expect(a).toEqual({ x: 1 });
    expect(b).toEqual({ y: 2 });
  });

  it('handles objects with getter properties', () => {
    const obj = {
      get foo() {
        return 123;
      },
      bar: 456,
    };
    const result = toAssigned(obj);
    expect(result).toHaveProperty('foo', 123);
    expect(result).toHaveProperty('bar', 456);
  });

  it('handles array-like objects', () => {
    const arr = [1, 2, 3];
    const newArr = toAssigned(arr);
    expect(newArr.length).toEqual(arr.length);
    expect(newArr).toEqual([1, 2, 3]);
  });

  it('handles objects with prototype chain', () => {
    const proto = { a: 1 };
    const obj = Object.create(proto);
    obj.b = 2;
    expect(toAssigned(obj)).toEqual({ b: 2 });
  });

  it('handles symbol and string keys together', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, [sym]: 2 };
    expect(toAssigned(obj)).toEqual({ foo: 1, [sym]: 2 });
  });

  it('handles edge case: all arguments are non-objects', () => {
    expect(toAssigned(null, undefined, 0, '', false)).toEqual({});
  });

  it('handles edge case: objects with undefined/null prototype', () => {
    const obj = Object.create(null);
    obj.x = 1;
    expect(toAssigned(obj)).toEqual({ x: 1 });
  });
});
