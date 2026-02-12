import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { getPackageInfo } from './common/package-info.js';

export async function test(who: string | undefined) {
  const info = getPackageInfo(who);
  const env = { ...process.env, LIB_PACKAGE_PATH: dirname(info.path) };

  const vitestConfigPath = resolve('vitest.config.ts');
  const testPackageDir = resolve(info.path, '..', 'tests');
  console.log('testPackageDir', testPackageDir);

  if (info.json.scripts?.test) {
    execSync(`vitest ${testPackageDir} --config ${vitestConfigPath}`, { stdio: 'inherit', env });
  } else {
    console.warn(`Package ${info.name} has no test script, skipping...`);
  }
}
