// Cache global methods for better performance and robustness
export const $create = Object.create;
export const ObjectPrototype = Object.prototype;
export const ObjectValueOf = ObjectPrototype.valueOf;

export const $get = Reflect.get;
export const $set = Reflect.set;
export const $has = Reflect.has;
export const $ownKeys = Reflect.ownKeys;
export const $getPrototypeOf = Reflect.getPrototypeOf;
export const $delete = Reflect.deleteProperty;
export const $define = Reflect.defineProperty;

export const $isArray = Array.isArray;
export const $arrayFrom = Array.from;

export const $isView = ArrayBuffer.isView;
export const $arrayBufferSlice = ArrayBuffer.prototype.slice;

export const BigIntConstructor = typeof BigInt !== 'undefined' ? BigInt : undefined;
