export const ownKeys = Reflect.ownKeys;
export const setPrototypeOf = Reflect.setPrototypeOf;
export const getPrototypeOf = Reflect.getPrototypeOf;
export const isEnumerable = Object.prototype.propertyIsEnumerable;
export const isArray = Array.isArray;
export const create = Object.create;
export const defineProperty = Reflect.defineProperty;

export const notPrimitive = (v: unknown): v is object =>
  v !== null && (typeof v === 'object' || typeof v === 'function');

/**
 * ! Only use when `fn` is known to be a function
 *
 * This is the simplified version
 * @see https://github.com/baendlorel/get-function-features
 */
export const isArrowFunction = (fn: new () => any) => {
  try {
    const p = new Proxy(fn, { construct: () => ({}) });
    new p();
    return false;
  } catch {
    return true;
  }
};
