import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { askYesNo } from './common/ask.js';
import { getPackageInfo } from './common/package-info.js';
import { Version } from './common/version.js';

export async function publish(who: string | undefined) {
  const info = getPackageInfo(who);

  const newVersionStr = Version.max(info.version).duplicate().bumpPatch().toString();

  console.log(`Build and publish:${info.name}@${info.json.version} -> v${newVersionStr}`);

  const goon = await askYesNo(`Publish version ${newVersionStr} for package: ${info.name}?`);

  if (!goon) {
    console.log('Aborted.');
    return;
  }

  info.json.version = newVersionStr;
  writeFileSync(info.path, JSON.stringify(info.json, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${info.name} to version ${newVersionStr}`);

  execSync(`git commit -am "release: ${newVersionStr}"`, { stdio: 'inherit' });
  execSync(`git tag v${info.name}@${newVersionStr}`, { stdio: 'inherit' });

  const env = { ...process.env, LIB_PACKAGE_PATH: info.path };
  execSync(`pnpm --filter ${info.name} build`, { stdio: 'inherit', env });
  execSync(`pnpm --filter ${info.name} publish --no-git-checks --access public`, { stdio: 'inherit', env });
  console.log(`Published ${info.name}@${newVersionStr}`);

  // pnpm --filter @ktjs/router build && pnpm --filter @ktjs/router publish --no-git-checks --access public
  // pnpm --filter @ktjs/example dev  --no-git-checks
}
