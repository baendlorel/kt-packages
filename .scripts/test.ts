import { execSync } from 'node:child_process';
import { dirname } from 'node:path';
import { getPackageInfo } from './common/package-info.js';

export async function test(who: string | undefined) {
  const info = getPackageInfo(who);
  const env = { ...process.env, LIB_PACKAGE_PATH: dirname(info.path) };

  if (info.json.scripts?.test) {
    execSync(`pnpm --filter ${info.name} test`, { stdio: 'inherit', env });
  } else {
    console.warn(`Package ${info.name} has no test script, skipping...`);
  }
}
