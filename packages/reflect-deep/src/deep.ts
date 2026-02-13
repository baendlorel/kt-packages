import { isPrimitive, expectTargetAndKeys, expectTarget } from './common.js';
import {
  BigIntConstructor,
  ObjectValueOf,
  $create,
  $isArray,
  $isView,
  $arrayBufferSlice,
  $getPrototypeOf,
  $ownKeys,
  $has,
  $get,
  $set,
  $delete,
  $define,
  $arrayFrom,
} from './native.js';

interface ReachResult {
  /**
   * The furthest reachable value in the object at the given property path.
   */
  value: any;

  /**
   * The index in `propertyKeys` of the last successfully accessed property.
   * - Will be -1 if the first property failed.
   */
  index: number;

  /**
   * Whether the path was fully traversed and the final value was successfully reached.
   */
  reached: boolean;
}

interface GroupedKey {
  /**
   * Keys (includes symbols)
   */
  keys: (string | symbol)[];

  /**
   * Target itself or its prototype.
   */
  object: any;
}

function deepClone(cache: WeakMap<any, any>, o: any): any {
  if (typeof o !== 'object' || o === null) {
    return o;
  }

  if (cache.has(o)) {
    return cache.get(o);
  }

  // # Boxed primitives (Number, String, Boolean, BigInt, Symbol objects)
  if (
    o instanceof Number ||
    o instanceof String ||
    o instanceof Boolean ||
    (BigIntConstructor && o instanceof BigIntConstructor)
  ) {
    // Create new boxed primitive with the same value
    const primitiveValue = ObjectValueOf.call(o);
    if (o instanceof Number) {
      return new Number(primitiveValue);
    }
    if (o instanceof String) {
      return new String(primitiveValue);
    }
    if (o instanceof Boolean) {
      return new Boolean(primitiveValue);
    }
    if (BigIntConstructor && o instanceof BigIntConstructor)
      return $create(BigIntConstructor.prototype, {
        [Symbol.toPrimitive]: {
          value: () => primitiveValue,
          enumerable: false,
          configurable: false,
        },
      });
  }

  // # Common types
  if ($isArray(o)) {
    const result: any[] = [];
    cache.set(o, result);
    for (let i = 0; i < o.length; i++) {
      if (i in o) {
        result[i] = deepClone(cache, o[i]);
      }
    }
    return result;
  }

  if (o instanceof Map) {
    const result = new Map();
    cache.set(o, result);
    o.forEach((v, k) => result.set(deepClone(cache, k), deepClone(cache, v)));
    return result;
  }

  if (o instanceof Set) {
    const result = new Set();
    cache.set(o, result);
    o.forEach((v) => result.add(deepClone(cache, v)));
    return result;
  }

  if (o instanceof Date) {
    return new Date(o);
  }

  if (o instanceof RegExp) {
    return new RegExp(o.source, o.flags);
  }

  // #  Values cannot be copied
  if (o instanceof WeakMap) {
    return o;
  }

  if (o instanceof WeakSet) {
    return o;
  }

  if (o instanceof WeakRef) {
    return new WeakRef(deepClone(cache, o.deref()));
  }

  if (o instanceof Promise) {
    return o;
  }

  if (SharedArrayBuffer && o instanceof SharedArrayBuffer) {
    // SharedArrayBuffer cannot be cloned safely, return the same reference
    return o;
  }

  // # Typed arrays and DataView
  if ($isView(o)) {
    const TypedArray = (o as any).constructor;
    if (o instanceof DataView) {
      // DataView needs special handling - copy the underlying buffer and recreate
      const clonedBuffer = $arrayBufferSlice.call(o.buffer, o.byteOffset, o.byteOffset + o.byteLength);
      return new DataView(clonedBuffer);
    } else {
      // TypedArrays can be created from the original array
      return new TypedArray(o);
    }
  }

  if (o instanceof ArrayBuffer) {
    return $arrayBufferSlice.call(o, 0);
  }

  // # Node.js Buffer (if available)
  if (Buffer && o instanceof Buffer) {
    return Buffer.from(o);
  }

  // # Copy everything else
  const result = $create($getPrototypeOf(o));
  cache.set(o, result);

  const keys = $ownKeys(o);
  for (let i = 0; i < keys.length; i++) {
    // some prop may be carried over from prototype chain, so we need to check if it exists on the object
    if (!$has(o, keys[i])) {
      continue;
    }

    const value = $get(o, keys[i]);
    $set(result, keys[i], deepClone(cache, value));
  }
  return result;
}

const NOT_PROVIDED = Symbol('NOT_PROVIDED');

/**
 * ## Usage
 * Just type ReflectDeep and add `.` to it to access its methods
 *
 * __PKG_INFO__
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export namespace ReflectDeep {
  /**
   * Checks if a nested property exists at the given path.
   * @param target - Target object to check.
   * @param propertyKeys - Property path to check.
   * @returns `true` if the property exists, `false` otherwise.
   * @throws If target is not an object or propertyKeys is invalid.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = { a: { b: { c: 'hello' } } };
   * ReflectDeep.has(obj, ['a', 'b', 'c']); // true
   */
  export const has = (target: object, propertyKeys: PropertyKey[]): boolean => {
    expectTargetAndKeys('has', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (!$has(current, propertyKeys[i])) {
        return false;
      }

      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return false;
      }
    }
    return $has(current, propertyKeys[propertyKeys.length - 1]);
  };

  /**
   * Gets the value of a nested property.
   * @param target - Target object.
   * @param propertyKeys - Property path.
   * @param receiver - The `this` value for getter calls.
   * @returns The property value, or `undefined` if not found.
   * @throws If target is not an object or propertyKeys is invalid.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = { a: { b: { c: 'hello' } } };
   * ReflectDeep.get(obj, ['a', 'b', 'c']); // 'hello'
   */
  export const get = <T = any>(
    target: any,
    propertyKeys: PropertyKey[],
    receiver: any = NOT_PROVIDED,
  ): T | undefined => {
    expectTargetAndKeys('get', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (!$has(current, propertyKeys[i])) {
        return undefined;
      }

      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return undefined;
      }
    }

    const result =
      receiver === NOT_PROVIDED
        ? $get(current, propertyKeys[propertyKeys.length - 1])
        : $get(current, propertyKeys[propertyKeys.length - 1], receiver);

    return result as T | undefined;
  };

  /**
   * Sets a nested property value, creating intermediate objects as needed.
   * @param target - Target object.
   * @param propertyKeys - Property path.
   * @param value - Value to set.
   * @param receiver - The `this` value for setter calls.
   * @returns `true` if successful, `false` otherwise.
   * @throws If target is not an object or propertyKeys is invalid.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = { };
   * ReflectDeep.set(obj, ['a', 'b', 'c'], 'hello'); // Creates nested structure
   * obj.a.b.c; // 'hello'
   */
  export const set = <T = any>(
    target: any,
    propertyKeys: PropertyKey[],
    value: T,
    receiver: any = NOT_PROVIDED,
  ): boolean => {
    expectTargetAndKeys('set', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (!$has(current, propertyKeys[i])) {
        if (!$set(current, propertyKeys[i], {})) {
          return false;
        }
      }

      // Check if current can be set
      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return false;
      }
    }

    return receiver === NOT_PROVIDED
      ? $set(current, propertyKeys[propertyKeys.length - 1], value)
      : $set(current, propertyKeys[propertyKeys.length - 1], value, receiver);
  };

  /**
   * Traverses a property path and returns the furthest reachable value with its index.
   * @param target - Target object to traverse.
   * @param propertyKeys - Property path to traverse.
   * @param receiver - The `this` value for getter calls.
   * @returns Object with `value` (furthest reachable value), `index` (position reached), and `reached` (whether the full path was traversed).
   * @throws If target is not an object or propertyKeys is invalid.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = { a: { b: { c: 'hello' } } };
   * ReflectDeep.reach(obj, ['a', 'b', 'c']); // { value: 'hello', index: 2, reached: true }
   * ReflectDeep.reach(obj, ['a', 'b', 'd']); // { value: { c: 'hello' }, index: 1, reached: false }
   * ReflectDeep.reach(obj, ['a', 'x']);     // { value: { b: { c: 'hello' } }, index: 0, reached: false }
   * ReflectDeep.reach(obj, ['d', 'x']);     // { value: { a: { b: { c: 'hello' } } }, index: -1, reached: false }
   */
  export const reach = (target: object, propertyKeys: PropertyKey[], receiver: any = NOT_PROVIDED): ReachResult => {
    expectTargetAndKeys('reach', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length; i++) {
      if (!$has(current, propertyKeys[i])) {
        return { value: current, index: i - 1, reached: false };
      }

      if (i === propertyKeys.length - 1) {
        const value =
          receiver === NOT_PROVIDED ? $get(current, propertyKeys[i]) : $get(current, propertyKeys[i], receiver);

        return { value, index: i, reached: true };
      }

      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return { value: current, index: i, reached: false };
      }
    }

    // Should not reach here, but just in case
    return { value: current, index: -1, reached: false };
  };

  /**
   * Creates a deep clone of an object, handling circular references and various JS types.
   *
   * **Circular references are fully suppported**
   *
   * ! Will not check depth of the object, so be careful with very deep objects.
   * @param obj - Object to clone.
   * @returns A deep clone of the object.
   * @example
   * const obj = { a: { b: [1, 2, { c: 3 }] } };
   * const cloned = ReflectDeep.clone(obj);
   * cloned.a.b[2].c = 4; // obj.a.b[2].c is still 3
   */
  export const clone = <T = any>(obj: T): T => {
    return deepClone(new WeakMap(), obj);
  };

  /**
   * Deletes a nested property at the given path.
   *
   * **Has same behavior as the original `Reflect.deleteProperty`**
   * - property does not exist, return `true`
   * - exists and configurable, return `true`
   * - exists but not configurable, return `false`
   * - `target` is frozen, return `false`
   * @param target Target object.
   * @param propertyKeys Property path to delete.
   * @returns `true` if successful, `false` otherwise.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = { a: { b: { c: 'hello', d: 'world' } } };
   * ReflectDeep.deleteProperty(obj, ['a', 'b', 'c']); // true
   * obj.a.b; // { d: 'world' }
   */
  export const deleteProperty = (target: object, propertyKeys: PropertyKey[]): boolean => {
    expectTargetAndKeys('deleteProperty', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (!$has(current, propertyKeys[i])) {
        return true;
      }

      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return false;
      }
    }

    return $delete(current, propertyKeys[propertyKeys.length - 1]);
  };

  /**
   * Defines a nested property with the given descriptor, creating intermediate objects as needed.
   *
   * **Has same behavior as the original `Reflect.defineProperty`**
   * @param target Target object.
   * @param propertyKeys Property path to define.
   * @param descriptor Property descriptor to apply.
   * @returns `true` if successful, `false` otherwise.
   * @throws If target is not an object or propertyKeys is not a valid non-empty array.
   * @example
   * const obj = {};
   * ReflectDeep.defineProperty(obj, ['a', 'b', 'c'], { value: 'hello', writable: true });
   * obj.a.b.c; // 'hello'
   *
   * // Define getter/setter
   * ReflectDeep.defineProperty(obj, ['x', 'y'], {
   *   get() { return this._value; },
   *   set(v) { this._value = v; }
   * });
   */
  export const defineProperty = (
    target: object,
    propertyKeys: PropertyKey[],
    descriptor: PropertyDescriptor,
  ): boolean => {
    expectTargetAndKeys('defineProperty', target, propertyKeys);

    let current = target;
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (!$has(current, propertyKeys[i])) {
        if (!$set(current, propertyKeys[i], {})) {
          return false;
        }
      }

      current = $get(current, propertyKeys[i]);
      if (isPrimitive(current)) {
        return false;
      }
    }

    return $define(current, propertyKeys[propertyKeys.length - 1], descriptor);
  };

  /**
   * Gets all property keys (including symbols) from the target object and its prototype chain.
   * Returns a flattened array of unique keys from all prototype layers.
   * @param target - Target object to extract keys from.
   * @returns Array of all unique property keys from the object and its prototype chain.
   * @throws If target is not an object.
   * @throws If target is not an object.
   * @example
   * const obj = { own: 'property', [Symbol('sym')]: 'symbol' };
   * const keys = ReflectDeep.keys(obj);
   * // Returns: ['own', Symbol(sym), 'toString', 'valueOf', ...] (includes prototype keys)
   *
   * // Works with custom prototypes
   * function Parent() {}
   * Parent.prototype.parentProp = 'parent';
   * const child = Object.create(Parent.prototype);
   * child.childProp = 'child';
   * ReflectDeep.keys(child); // ['childProp', 'parentProp', 'toString', ...]
   */
  export const keys = <T extends object>(target: T): (string | symbol)[] => {
    expectTarget('keys', target);

    const keySet = new Set($ownKeys(target));
    let proto: object | null = target;
    while (true) {
      proto = $getPrototypeOf(proto);

      // * Proto chain will not contain any loop
      if (proto) {
        const keys = $ownKeys(proto);
        for (let i = 0; i < keys.length; i++) {
          keySet.add(keys[i]);
        }
      } else {
        return $arrayFrom(keySet);
      }
    }
  };

  /**
   * Gets property keys grouped by prototype layer, preserving the prototype chain structure.
   * Returns an array where each element represents a layer in the prototype chain with its keys and object reference.
   * @param target - Target object to extract grouped keys from.
   * @returns Array of objects, each containing `keys` and `object` for each prototype layer.
   * @throws If target is not an object.
   * @throws If target is not an object.
   * @example
   * const obj = { own: 'property', [Symbol('sym')]: 'symbol' };
   * const grouped = ReflectDeep.groupedKeys(obj);
   * // Returns: [
   * //   { keys: ['own', Symbol(sym)], object: obj },
   * //   { keys: ['toString', 'valueOf', ...], object: Object.prototype },
   * //   { keys: [], object: null }
   * // ]
   *
   * // Useful for inspecting prototype chain structure
   * function Parent() {}
   * Parent.prototype.parentProp = 'parent';
   * const child = Object.create(Parent.prototype);
   * child.childProp = 'child';
   * const layers = ReflectDeep.groupedKeys(child);
   * // layers[0] = { keys: ['childProp'], object: child }
   * // layers[1] = { keys: ['parentProp'], object: Parent.prototype }
   * // layers[2] = { keys: ['toString', ...], object: Object.prototype }
   */
  export const groupedKeys = <T extends object>(target: T): GroupedKey[] => {
    expectTarget('groupedKeys', target);

    const keys: GroupedKey[] = [{ keys: $ownKeys(target), object: target }];
    let proto = $getPrototypeOf(target);
    while (true) {
      // * Proto chain will not contain any loop
      if (!proto) {
        return keys;
      }
      keys.push({
        object: proto,
        keys: $ownKeys(proto),
      });
      proto = $getPrototypeOf(proto);
    }
  };
}
