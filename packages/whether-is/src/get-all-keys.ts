import { ReflectOwnKeys, ReflectGetPrototypeOf } from './global-methods.js';

export function getAllKeys(o: any) {
  let p = o;
  const keys = new Set<string | symbol>();
  while (p !== null) {
    ReflectOwnKeys(p).forEach((k) => keys.add(k));
    p = ReflectGetPrototypeOf(p);
  }
  return keys;
}
