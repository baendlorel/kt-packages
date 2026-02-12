import { readdirSync } from 'node:fs';
import path from 'node:path';

export function getVitestAliases() {
  const packageDirs = readdirSync(path.join(import.meta.dirname, 'packages'));
  const alias: Record<string, string> = {};
  for (const dir of packageDirs) {
    alias[`@${dir}`] = path.join(import.meta.dirname, 'packages', dir, 'src');
  }
  return alias;
}

export function getRollupAliases() {
  const packageDirs = readdirSync(path.join(import.meta.dirname, 'packages'));
  const alias: { entries: Array<{ find: RegExp | string; replacement: string }> } = { entries: [] };
  for (const dir of packageDirs) {
    alias.entries.push({
      find: new RegExp(`^@${dir}`),
      replacement: path.join(import.meta.dirname, 'packages', dir, 'src'),
    });
  }
  return alias;
}
