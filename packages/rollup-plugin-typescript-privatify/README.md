# rollup-plugin-typescript-privatify

Custom transformer preset for `@rollup/plugin-typescript`.

It rewrites TypeScript `private` class members into runtime-private implementations.

## Install

```bash
pnpm add -D rollup-plugin-typescript-privatify @rollup/plugin-typescript typescript
```

## Usage

```ts
import typescript from '@rollup/plugin-typescript';
import typescriptPrivatify from 'rollup-plugin-typescript-privatify';

export default {
  plugins: [
    typescript({
      transformers: typescriptPrivatify({
        mode: 'hash', // or "weakmap"
      }),
    }),
  ],
};
```

## Options

- `mode: "hash" | "weakmap"` (default: `"hash"`)
  - `hash`: convert `private foo` to `#foo`.
  - `weakmap`: generate a companion `ClassName__private` and a `WeakMap` to store private state/methods.

## weakmap mode shape

For `class A`, the transformer emits:

- `class A__private { ... }`
- `const __A_private = new WeakMap();`
- `__A_private.set(this, new A__private())` in constructor
- private method calls become `__A_private.get(this).method.call(this, ...)`

## Notes

- This package is a transformer preset, not a direct Rollup plugin.
- Anonymous classes in `weakmap` mode fall back to `hash` mode.
