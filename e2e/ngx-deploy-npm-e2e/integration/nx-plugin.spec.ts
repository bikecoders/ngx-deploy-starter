import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nx JS', () => {
  initNgxDeployNPMProject();

  const libName = 'nx-plugin';
  const nxPlugin = '@nrwl/nx-plugin';

  basicSetTestForLibs(libName, nxPlugin, {
    generator: 'plugin',
    setPublishableOption: false,
  });
});
