import { runCommand, runNxCommand, uniq } from '@nrwl/nx-plugin/testing';
import {
  initNgxDeployNPMProject,
  installDependencies,
  generateLib,
  installNgxDeployNPMProject,
  currentNrwlVersion,
} from '../utils';

describe('React Native', () => {
  initNgxDeployNPMProject();

  const libName = 'react-native-lib';
  const nxPlugin = '@nrwl/react-native';
  const uniqLibName = uniq(libName);

  installDependencies(nxPlugin);

  beforeEach(() => {
    runNxCommand(`generate ${nxPlugin}:init`);
    runCommand(
      `yarn add -D @babel/preset-react @nrwl/web@${currentNrwlVersion}`
    );
  });

  generateLib(nxPlugin, uniqLibName);

  beforeEach(() => {
    runNxCommand(
      `generate ${nxPlugin}:component layout --project=${uniqLibName} --export`
    );
  });

  // Install the project
  installNgxDeployNPMProject();

  it('should publish the lib', () => {
    expect(() => {
      runNxCommand(`deploy ${uniqLibName} --dry-run`);
    }).not.toThrow();
  }, 120000);
});
