import { execSync } from 'child_process';
import { getPackageInfo } from './common/consts';

export async function test(who: string | undefined) {
  const info = getPackageInfo(who);
  for (const p of info) {
    if (p.json.scripts?.test) {
      execSync(`pnpm --filter ${p.name} test`, { stdio: 'inherit' });
    } else {
      console.warn(`Package ${p.name} has no test script, skipping...`);
    }
  }
}
