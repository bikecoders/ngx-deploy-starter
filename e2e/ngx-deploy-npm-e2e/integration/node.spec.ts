import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Node', () => {
  initNgxDeployNPMProject();

  const libName = 'node-lib';
  const nxPlugin = '@nrwl/node';

  basicSetTestForLibs(libName, nxPlugin);
});
