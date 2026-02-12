import { PRIVATE } from './common.js';

export function expect(o: unknown, message: string): void {
  if (!o) {
    throw new Error('[__NAME__] ' + message);
  }
}

export function warn(message: string): void {
  console.warn('[__NAME__] ' + message);
}

export function expectPrivate(priv: symbol, msg = 'This method is private!') {
  if (priv !== PRIVATE) {
    throw new Error('[__NAME__] ' + msg);
  }
}
