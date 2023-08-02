import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Next', () => {
  initNgxDeployNPMProject();

  const libName = 'next-js';
  const nxPlugin = '@nx/next';

  basicSetTestForLibs(libName, nxPlugin, {
    libGeneratorCommandOptions: '--style css --bundler rollup --directory libs',
  });
});
