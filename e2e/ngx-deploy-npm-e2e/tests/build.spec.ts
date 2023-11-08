import { checkFilesExist, runNxCommand } from '@nx/plugin/testing';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '../utils';

describe('build', () => {
  const publishableLib = 'basic-lib';
  const nxPlugin = '@nx/node';

  initNgxDeployNPMProject();
  installDependencies(nxPlugin);

  generateLib(nxPlugin, publishableLib, `--dir="libs"`);

  // Install the project
  installNgxDeployNPMProject();

  it('should build the lib', () => {
    runNxCommand(`deploy ${publishableLib} --dry-run`);

    expect(() =>
      checkFilesExist(`dist/libs/${publishableLib}/package.json`)
    ).not.toThrow();
  }, 120000);
});
