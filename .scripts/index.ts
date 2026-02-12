#!/usr/bin/env tsx
import { renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { askYesNo } from './common/ask.js';
import { getPackageGroup, getTagName } from './common/consts.js';
import { Version } from './common/version.js';

async function publish(who: string | undefined) {
  const info = getPackageGroup(who);

  const newVersionStr = Version.max(...info.map((i) => i.version))
    .duplicate()
    .bumpPatch()
    .toString();

  console.log(`Build and publish: ${info.map((p) => `${p.name}@${p.json.version}`).join(', ')} -> v${newVersionStr}`);

  const goon = await askYesNo(`Publish version ${newVersionStr} for packages: ${info.map((i) => i.name).join(', ')}?`);

  if (!goon) {
    console.log('Aborted.');
    return;
  }

  for (const p of info) {
    p.json.version = newVersionStr;
    writeFileSync(p.path, JSON.stringify(p.json, null, 2) + '\n', 'utf-8');
    console.log(`Updated ${p.name} to version ${newVersionStr}`);
  }

  execSync(`git commit -am "release: ${newVersionStr}"`, { stdio: 'inherit' });
  execSync(`git tag v${getTagName(who)}-${newVersionStr}`, { stdio: 'inherit' });

  for (const p of info) {
    const env = { ...process.env, LIB_PACKAGE_PATH: p.name };
    execSync(`pnpm --filter ${p.name} build`, { stdio: 'inherit', env });
    execSync(`pnpm --filter ${p.name} publish --no-git-checks --access public`, { stdio: 'inherit', env });
    console.log(`Published ${p.name}@${newVersionStr}`);
  }

  // pnpm --filter @ktjs/router build && pnpm --filter @ktjs/router publish --no-git-checks --access public
  // pnpm --filter @ktjs/example dev  --no-git-checks
}

async function build(who: string | undefined) {
  const info = getPackageGroup(who);
  for (const p of info) {
    if (p.json.scripts?.build) {
      execSync(`pnpm --filter ${p.name} build`, { stdio: 'inherit' });
    } else {
      console.warn(`Package ${p.name} has no test script, skipping...`);
    }
  }
}

async function test(who: string | undefined) {
  const info = getPackageGroup(who);
  for (const p of info) {
    if (p.json.scripts?.test) {
      execSync(`pnpm --filter ${p.name} test`, { stdio: 'inherit' });
    } else {
      console.warn(`Package ${p.name} has no test script, skipping...`);
    }
  }
}

const task = process.argv[2];
const [who] = process.argv.slice(3);
if (task === '--publish') {
  publish(who);
} else if (task === '--build') {
  build(who);
} else if (task === '--test') {
  test(who);
} else {
  console.error(`Unknown task: ${task}`);
}
