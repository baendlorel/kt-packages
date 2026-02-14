import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const packagesDir = path.resolve('packages');
function getVitestAliases() {
  const packageDirs = readdirSync(packagesDir);
  const alias: Record<string, string> = {};
  for (const dir of packageDirs) {
    alias[`@${dir}`] = path.join(packagesDir, dir, 'src');
  }
  return alias;
}

export default defineConfig(() => {
  const packageDirs = readdirSync(packagesDir);
  const alias: Record<string, string> = {};
  for (const dir of packageDirs) {
    alias[`@${dir}`] = path.join(packagesDir, dir, 'src');
  }

  return {
    test: {
      // setupFiles: ['./src/macros.ts'],
      include: ['**/*.{test,spec,e2e-spec}.?(c|m)[jt]s?(x)'],
      silent: false,
    },
    resolve: {
      alias: getVitestAliases(),
    },
  };
});
