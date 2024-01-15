import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Nx Plugin', () => {
  initNgxDeployNPMProject();

  const libName = 'nx-plugin';
  const nxPlugin = '@nx/plugin';

  basicSetTestForLibs(libName, nxPlugin, {
    generator: 'plugin',
    setPublishableOption: false,
    libGeneratorCommandOptions: '--directory="libs"',
  });
});
