Reflect.set(globalThis, '__INVALID_LENGTH_THROW__', function (len: number) {
  if (len % 2 !== 0) {
    throw new Error('Invalid items length, must be even number.');
  }
});
Reflect.set(globalThis, '__IS_DEV__', true);
