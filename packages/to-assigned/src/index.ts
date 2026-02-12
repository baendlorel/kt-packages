import {
  getPrototypeOf,
  ownKeys,
  isEnumerable,
  isArray,
  setPrototypeOf,
  notPrimitive,
  isArrowFunction,
  defineProperty,
} from './native.js';

type Class = new (...args: any[]) => any;

function createResult(sources: any[]) {
  const o = sources.find(notPrimitive);
  if (!o) {
    return {};
  }

  const proto = getPrototypeOf(o);

  let result: any;
  if (isArray(o)) {
    result = [];
  } else if (typeof o === 'function') {
    let fn: (...args: unknown[]) => unknown;
    if (isArrowFunction(o as Class)) {
      fn = (...args: any[]) => o(...args);
    } else {
      fn = function (...args: any[]) {
        return o(...args);
      };
      fn.bind = (thisArg: any, ...args: any[]) => o.bind(thisArg, ...args);
    }
    // mimic name and length
    defineProperty(fn, 'name', { value: o.name, configurable: true });
    defineProperty(fn, 'length', { value: o.length, configurable: true });
    result = fn;
  } else if (o instanceof Map) {
    result = new Map(o.entries());
  } else if (o instanceof Set) {
    result = new Set(o.values());
  } else if (o instanceof WeakMap) {
    result = new WeakMap();
  } else if (o instanceof WeakSet) {
    result = new WeakSet();
  } else if (o instanceof Date) {
    result = new Date(o.getTime());
  } else {
    result = {};
  }

  setPrototypeOf(result, proto);
  return result;
}

/**
 * ## Usage
 * Creates a new object, array, function, or special object with properties from the provided sources.
 * Prototype and type are determined by the first non-primitive source (see below):
 *
 * - The sources are never modified.
 * - Non-object arguments are ignored.
 * - If all sources are primitive, returns `{}`.
 * - If the first non-primitive source is:
 *   - **Array**: result is an array, prototype same as source.
 *   - **Function**: result is a function with same `name`, `length`, and prototype. (`caller`, `callee`, `arguments` not copied)
 *   - **Map/Set/WeakMap/WeakSet/Date**: result is a new instance of the same type, initialized from the first source (only own enumerable properties are merged, not collection contents).
 *   - **Other object**: result is a plain object with the same prototype as the source.
 *
 * - Only enumerable properties (including symbol keys) are copied from all sources.
 *
 * @returns A new object, array, function, or special object with merged properties and inherited prototype/type.
 *
 * __PKG_INFO__
 */
export function toAssigned(...sources: any[]): any {
  if (sources.length === 0) {
    return {};
  }

  const o = createResult(sources);
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    if (s && typeof s === 'object') {
      for (const key of ownKeys(s)) {
        if (isEnumerable.call(s, key)) {
          o[key] = s[key];
        }
      }
    }
  }
  return o;
}

Reflect.set(toAssigned, Symbol('version'), '__VERSION__');
