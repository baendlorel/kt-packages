import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import typescriptPrivatify from '../src/index.js';

function transpile(input: string, mode: 'hash' | 'weakmap' = 'hash') {
  return ts.transpileModule(input, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
    transformers: typescriptPrivatify({ mode }),
  }).outputText;
}

function compact(code: string) {
  return code.replace(/\s+/g, '');
}

describe('rollup-plugin-typescript-privatify', () => {
  it('returns before transformers for @rollup/plugin-typescript', () => {
    const config = typescriptPrivatify();
    expect(config.before).toHaveLength(1);
    expect(typeof config.before[0]).toBe('function');
  });

  it('converts private members to ECMAScript hash private fields in hash mode', () => {
    const source = `
      class A {
        private count = 1;
        private static version = 0;

        private inc(step: number) {
          this.count += step;
          return this.count;
        }

        static nextVersion() {
          this.version += 1;
          return this.version;
        }

        public run() {
          return this.inc(2);
        }
      }
    `;

    const output = compact(transpile(source, 'hash'));
    expect(output).toContain('#count=1;');
    expect(output).toContain('static#version=0;');
    expect(output).toContain('#inc(step){');
    expect(output).toContain('this.#count+=step;');
    expect(output).toContain('this.#version+=1;');
    expect(output).toContain('returnthis.#inc(2);');
  });

  it('extracts instance private members into companion class in weakmap mode', () => {
    const source = `
      class A {
        private value = 1;

        private bump(delta: number) {
          this.value += delta;
          return this.value;
        }

        read(n: number) {
          return this.bump(n) + this.value;
        }
      }
    `;

    const output = compact(transpile(source, 'weakmap'));
    expect(output).toContain('classA__private{');
    expect(output).toContain('const__A_private=newWeakMap();');
    expect(output).toContain('__A_private.set(this,newA__private());');
    expect(output).toContain('__A_private.get(this).bump.call(this,n)');
    expect(output).toContain('__A_private.get(this).value');
  });

  it('adds constructor initialization after super() when class extends another class', () => {
    const source = `
      class Base {
        constructor(...args: any[]) {}
      }

      class Child extends Base {
        private count = 0;

        getCount() {
          return this.count;
        }
      }
    `;

    const output = compact(transpile(source, 'weakmap'));
    expect(output).toContain('classChildextendsBase{constructor(...args){super(...args);__Child_private.set(this,newChild__private());}');
    expect(output).toContain('return__Child_private.get(this).count;');
  });

  it('ignores class expressions but still handles anonymous class declarations', () => {
    const source = `
      class Named {
        private value = 1;
        read() {
          return this.value;
        }
      }

      const Expr = class {
        private value = 2;
        read() {
          return this.value;
        }
      };

      export default class {
        private value = 3;
        read() {
          return this.value;
        }
      }
    `;

    const output = compact(transpile(source, 'hash'));
    expect(output).toContain('classNamed{#value=1;read(){returnthis.#value;}}');
    expect(output).toContain('constExpr=class{value=2;read(){returnthis.value;}};');
    expect(output).toContain('exportdefaultclass{#value=3;read(){returnthis.#value;}}');
  });

  it('avoids hash private name collisions in hash mode', () => {
    const source = `
      class A {
        #value = 10;
        private value = 1;
        private static value = 2;

        getValue() {
          return this.value;
        }

        static getStaticValue() {
          return this.value;
        }
      }
    `;

    const output = compact(transpile(source, 'hash'));
    expect(output).toContain('#value=10;');
    expect(output).toContain('#value_1=1;');
    expect(output).toContain('static#value_2=2;');
    expect(output).toContain('returnthis.#value_1;');
    expect(output).toContain('returnthis.#value_2;');
  });
});
