import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('React Native', () => {
  initNgxDeployNPMProject();

  const libName = 'react-native-lib';
  const nxPlugin = '@nrwl/react';

  basicSetTestForLibs(libName, nxPlugin);
});
