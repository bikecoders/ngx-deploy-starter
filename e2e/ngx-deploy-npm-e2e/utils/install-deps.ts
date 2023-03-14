import { runCommand } from '@nrwl/nx-plugin/testing';
import { currentNrwlVersion } from './get-nrwl-current-version';

export function installDependencies(nxPlugin: string) {
  beforeEach(() => {
    const packageToInstall = `${nxPlugin}@${currentNrwlVersion}`;
    runCommand(`npm add -D ${packageToInstall}`);
    runCommand(`npx nx g ${nxPlugin}:init`);
  }, 120000);
}
