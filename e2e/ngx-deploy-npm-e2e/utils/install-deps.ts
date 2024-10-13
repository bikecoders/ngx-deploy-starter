import { runCommand } from '@nx/plugin/testing';
import { currentNxVersion } from './get-nx-current-version';

export function installDependencies(nxPlugin: string) {
  const packageToInstall = `${nxPlugin}@${currentNxVersion}`;

  runCommand(`npm add -D ${packageToInstall}`, {});
  runCommand(`npx nx g ${nxPlugin}:init`, {});
}
