import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nest', () => {
  initNgxDeployNPMProject();

  const libName = 'nest-lib';
  const nxPlugin = '@nrwl/nest';

  basicSetTestForLibs(libName, nxPlugin);
});
