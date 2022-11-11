import { basicSetTestForLibs, initNgxDeployNPMProject } from '../utils';

describe('Angular', () => {
  initNgxDeployNPMProject();

  const libName = 'angular-lib';
  const nxPlugin = '@nrwl/angular';

  basicSetTestForLibs(libName, nxPlugin);
});
