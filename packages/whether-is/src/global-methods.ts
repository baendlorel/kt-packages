// Object static methods
export const $is = Object.is;
export const ObjectPrototype = Object.prototype;

// Reflect methods
export const $ownKeys = Reflect.ownKeys;
export const $get = Reflect.get;
export const $getPrototypeOf = Reflect.getPrototypeOf;

// Array methods
export const $isArray = Array.isArray;

// Number static methods
export const $isNaN = Number.isNaN;
export const $isInt = Number.isInteger;
export const $isSafeInt = Number.isSafeInteger;
export const $isFinite = Number.isFinite;
export const $MAX_INT = Number.MAX_SAFE_INTEGER;
export const $MIN_INT = Number.MIN_SAFE_INTEGER;

// Function prototype methods
export const $fnToString = Function.prototype.toString;
