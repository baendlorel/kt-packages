/**
 * Cache of global methods for security and consistency
 */

// Object static methods
export const ObjectIs = Object.is;
export const ObjectGetPrototypeOf = Object.getPrototypeOf;
export const ObjectPrototype = Object.prototype;

// Reflect methods
export const ReflectOwnKeys = Reflect.ownKeys;
export const ReflectGet = Reflect.get;
export const ReflectGetPrototypeOf = Reflect.getPrototypeOf;

// Array methods
export const ArrayIsArray = Array.isArray;

// Number static methods
export const NumberIsNaN = Number.isNaN;
export const NumberIsInteger = Number.isInteger;
export const NumberIsSafeInteger = Number.isSafeInteger;
export const NumberIsFinite = Number.isFinite;
export const NumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
export const NumberMinSafeInteger = Number.MIN_SAFE_INTEGER;

// Function prototype methods
export const FunctionPrototypeToString = Function.prototype.toString;

// Symbol
export const SymbolIterator = Symbol.iterator;

// Boolean constructor
export const BooleanConstructor = Boolean;
