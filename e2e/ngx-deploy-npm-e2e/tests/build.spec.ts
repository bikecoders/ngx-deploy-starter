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
  installNgxDeployNPMProject(
    `--project="${publishableLib}" --distFolderPath="dist/libs/${publishableLib}"`
  );

  it('should build the lib due to the `dependsOn` option created on the target', () => {
    runNxCommand(`deploy ${publishableLib} --dry-run`);

    expect(() =>
      checkFilesExist(`dist/libs/${publishableLib}/package.json`)
    ).not.toThrow();
  }, 120000);
});
