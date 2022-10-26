import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nx JS', () => {
  initNgxDeployNPMProject();

  const libName = 'nx-js';
  const nxPlugin = '@nrwl/js';

  basicSetTestForLibs(libName, nxPlugin);
});
