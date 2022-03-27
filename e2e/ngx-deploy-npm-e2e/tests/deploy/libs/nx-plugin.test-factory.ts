import { runCommandAsync, runNxCommandAsync } from '@nrwl/nx-plugin/testing';
import {
  currentNrwlVersion,
  initNgxDeployNPMProject,
  installNgxDeployNPMProject,
} from '../../utils';

export const nxPlugins = () => {
  const libName = 'nx-plugin';
  const nxPlugin = '@nrwl/nx-plugin';

  initNgxDeployNPMProject();

  beforeEach(async () => {
    await runCommandAsync(`yarn add -D ${nxPlugin}@${currentNrwlVersion}`);
  }, 120000);

  beforeEach(async () => {
    await runNxCommandAsync(
      `generate ${nxPlugin}:plugin --name ${libName} --importPath ${libName}`
    );
  }, 120000);

  // Install the project
  installNgxDeployNPMProject();

  it('should publish the lib', done => {
    expect(async () => {
      await runNxCommandAsync(`deploy ${libName} --dry-run`);
      done();
    }).not.toThrow();
  }, 120000);
};
