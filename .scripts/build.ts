import { execSync } from 'node:child_process';
import { getPackageInfo } from './common/package-info';

export async function build(who: string | undefined) {
  const info = getPackageInfo(who);
  const env = { ...process.env, LIB_PACKAGE_PATH: info.path };
  // execSync(`pnpm --filter ${info.name} build`, { stdio: 'inherit', env });
  execSync(`rollup --config rollup.config.ts --configPlugin typescript`, { stdio: 'inherit', env });
}
