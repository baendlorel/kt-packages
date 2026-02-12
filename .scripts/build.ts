import { execSync } from 'node:child_process';
import { getPackageInfo } from './common/package-info';

export async function build(who: string | undefined) {
  const info = getPackageInfo(who);
  const env = { ...process.env, LIB_PACKAGE_PATH: info.name };

  if (info.json.scripts?.build) {
    execSync(`pnpm --filter ${info.name} build`, { stdio: 'inherit', env });
  } else {
    console.warn(`Package ${info.name} has no test script, skipping...`);
  }
}
