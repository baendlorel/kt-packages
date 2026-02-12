import { execSync } from 'node:child_process';
import { getPackageGroup } from './common/consts';

export async function build(who: string | undefined) {
  const info = getPackageGroup(who);
  for (const p of info) {
    if (p.json.scripts?.build) {
      execSync(`pnpm --filter ${p.name} build`, { stdio: 'inherit' });
    } else {
      console.warn(`Package ${p.name} has no test script, skipping...`);
    }
  }
}
