import { runCommand } from '@nrwl/nx-plugin/testing';
import { currentNrwlVersion } from './get-nrwl-current-version';

export function installDependencies(nxPlugin: string) {
  beforeEach(() => {
    const packageToInstall = `${nxPlugin}@${currentNrwlVersion}`;
    runCommand(`yarn add -D ${packageToInstall}`);
  }, 120000);
}
