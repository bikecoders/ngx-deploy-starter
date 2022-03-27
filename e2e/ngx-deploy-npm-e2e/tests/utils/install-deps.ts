import { logger } from '@nrwl/devkit';
import { runCommandAsync, runNxCommandAsync } from '@nrwl/nx-plugin/testing';
import { currentNrwlVersion } from './get-nrwl-current-version';

export function installDependencies(
  nxPlugin: string,
  extraInitOptions?: string
) {
  beforeEach(async () => {
    const packageToInstall = `${nxPlugin}@${currentNrwlVersion}`;
    await runCommandAsync(`yarn add -D ${packageToInstall}`);

    await runNxCommandAsync(
      `generate ${nxPlugin}:init ${extraInitOptions || ''}`
    );
  }, 120000);
}
