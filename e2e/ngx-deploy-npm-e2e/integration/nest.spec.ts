import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nest', () => {
  initNgxDeployNPMProject();

  const libName = 'nest-lib';
  const nxPlugin = '@nx/nest';

  basicSetTestForLibs(libName, nxPlugin);
});
