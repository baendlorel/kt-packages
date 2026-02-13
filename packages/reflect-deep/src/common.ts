// # utils
export function isPrimitive(o: unknown) {
  return (typeof o !== 'object' || o === null) && typeof o !== 'function';
}

export function expectTarget(fnName: string, o: unknown) {
  if (isPrimitive(o)) {
    $throw(`${fnName} called with non-object target: ${o}`);
  }
}

export function expectTargetAndKeys(fnName: string, o: unknown, keys: PropertyKey[]) {
  if (isPrimitive(o)) {
    $throw(`${fnName} called with non-object target: ${o}`);
  }
  if (!Array.isArray(keys)) {
    $throw(`${fnName} called with non-array keys`);
  }
  if (keys.length === 0) {
    $throw(`${fnName} called with empty array of keys`);
  }
}

export const $throw: (message: string) => never = (message: string): never => {
  throw new TypeError(`[__NAME__] ${message}`);
};
