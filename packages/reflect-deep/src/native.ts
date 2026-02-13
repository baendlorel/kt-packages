// Cache global methods for better performance and robustness
export const $get = Reflect.get;
export const $set = Reflect.set;
export const $has = Reflect.has;
export const $ownKeys = Reflect.ownKeys;
export const $getPrototypeOf = Reflect.getPrototypeOf;
export const $delete = Reflect.deleteProperty;
export const $define = Reflect.defineProperty;

export const $arrayFrom = Array.from;
export const $isArray = Array.isArray;
