import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nx JS', () => {
  initNgxDeployNPMProject();

  const libName = 'nx-js';
  const nxPlugin = '@nx/js';

  basicSetTestForLibs(libName, nxPlugin);
});
