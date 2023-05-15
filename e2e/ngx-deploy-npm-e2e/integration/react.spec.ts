import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('React', () => {
  initNgxDeployNPMProject();

  const libName = 'react-lib';
  const nxPlugin = '@nx/react';

  basicSetTestForLibs(libName, nxPlugin, {
    libGeneratorCommandOptions:
      '--style css --bundler vite --unitTestRunner jest',
  });
});
