import { basicSetTestForLibs, initNgxDeployNPMProject } from '../utils';

describe('Angular', () => {
  initNgxDeployNPMProject();

  const libName = 'angular-lib';
  const nxPlugin = '@nx/angular';

  basicSetTestForLibs(libName, nxPlugin);
});
