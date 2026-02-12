import { statSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const s = [] as string[];
readdirSync('.').forEach((dir) => {
  if (!existsSync(`${dir}/.gitignore`)) {
    return;
  }
  if (statSync(dir).isDirectory()) {
    console.log(`Merging .gitignore from ${dir}`);
    const content = readFileSync(`${dir}/.gitignore`, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim() !== '');
    s.push(...lines);
  }
});

const unique = Array.from(new Set(s));
writeFileSync('.gitignore', unique.join('\n'), 'utf-8');
