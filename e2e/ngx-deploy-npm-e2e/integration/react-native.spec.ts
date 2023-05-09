import { runCommand, runNxCommand, uniq } from '@nx/plugin/testing';
import {
  initNgxDeployNPMProject,
  installDependencies,
  generateLib,
  installNgxDeployNPMProject,
  currentNxVersion,
} from '../utils';

describe('React Native', () => {
  initNgxDeployNPMProject();

  const libName = 'react-native-lib';
  const nxPlugin = '@nx/react-native';
  const uniqLibName = uniq(libName);

  installDependencies(nxPlugin);

  beforeEach(() => {
    runNxCommand(`generate ${nxPlugin}:init`);
    runCommand(
      `npm add -D @babel/preset-react @nx/web@${currentNxVersion}`,
      {}
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
