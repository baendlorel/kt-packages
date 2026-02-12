import { describe, it, expect } from 'vitest';
import { toAssigned } from '../src';

// 用于测试 prototype 继承、数组和函数在第一格的情况

describe('toAssigned prototype and type inheritance', () => {
  it('result should inherit prototype from first object', () => {
    const proto = { foo: 123 };
    const obj = Object.create(proto);
    obj.bar = 456;
    const result = toAssigned(obj, { baz: 789 });
    expect(Object.getPrototypeOf(result)).toBe(proto);
    expect(result).toMatchObject({ bar: 456, baz: 789 });
    expect(result.foo).toBe(123);
  });

  it('result should be an array if first source is array', () => {
    const arr = [1, 2];
    const result = toAssigned(arr, { 2: 3, length: 3 });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([1, 2, 3]);
    expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(arr));
  });

  it('result should be a function if first source is function', () => {
    function fn(a: number, b: number) {
      return a + b;
    }
    (fn as any).extra = 42;
    const result = toAssigned(fn, { extra: 99 });
    expect(typeof result).toBe('function');
    expect(result(1, 2)).toBe(3);
    expect(result.extra).toBe(99);
    expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(fn));
    expect(result.name).toBe(fn.name);
    expect(result.length).toBe(fn.length);
  });

  it('result should have null prototype if first source is a primitive', () => {
    const result = toAssigned(123, { a: 1 });
    expect(Object.getPrototypeOf(result)).toBe(null);
    expect(result).toEqual({ a: 1 });
  });

  it('result should be a plain object if first source is Map/Set/WeakMap/WeakSet', () => {
    const result1 = toAssigned(new Map(), { a: 1 });
    const result2 = toAssigned(new Set(), { b: 2 });
    expect(Object.getPrototypeOf(result1)).toBe(Map.prototype);
    expect(Object.getPrototypeOf(result2)).toBe(Set.prototype);
    expect(result1.a).toEqual(1);
    expect(result2.b).toEqual(2);
  });
});
