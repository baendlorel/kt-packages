import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { askYesNo } from './common/ask';
import { getPackageGroup, getTagName } from './common/consts';
import { Version } from './common/version';

export async function publish(who: string | undefined) {
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
