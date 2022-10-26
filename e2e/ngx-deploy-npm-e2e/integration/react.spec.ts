import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('React', () => {
  initNgxDeployNPMProject();

  const libName = 'react-lib';
  const nxPlugin = '@nrwl/react';

  basicSetTestForLibs(libName, nxPlugin);
});
