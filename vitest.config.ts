import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { getVitestAliases } from './.scripts/aliases';

export default defineConfig(() => {
  const packageDirs = readdirSync(path.join(import.meta.dirname, 'packages'));
  const alias: Record<string, string> = {};
  for (const dir of packageDirs) {
    alias[`@${dir}`] = path.join(import.meta.dirname, 'packages', dir, 'src');
  }

  return {
    test: {
      // setupFiles: ['./src/macros.ts'],
      include: ['**/*.{test,spec,e2e-spec}.?(c|m)[jt]s?(x)'],
    },
    resolve: {
      alias: getVitestAliases(),
    },
  };
});
