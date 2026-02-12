import { readdirSync } from 'node:fs';
import path from 'node:path';

const packagesDir = path.join(import.meta.dirname, '..', 'packages');

export function getVitestAliases() {
  const packageDirs = readdirSync(packagesDir);
  const alias: Record<string, string> = {};
  for (const dir of packageDirs) {
    alias[`@${dir}`] = path.join(packagesDir, dir, 'src');
  }
  return alias;
}

export function getRollupAliases() {
  const packageDirs = readdirSync(packagesDir);
  const alias: { entries: Array<{ find: RegExp | string; replacement: string }> } = { entries: [] };
  for (const dir of packageDirs) {
    alias.entries.push({
      find: new RegExp(`^@${dir}`),
      replacement: path.join(packagesDir, dir, 'src'),
    });
  }
  return alias;
}
