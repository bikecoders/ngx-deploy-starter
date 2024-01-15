import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Node', () => {
  initNgxDeployNPMProject();

  const libName = 'node-lib';
  const nxPlugin = '@nx/node';

  basicSetTestForLibs(libName, nxPlugin, {
    libGeneratorCommandOptions: '--directory="libs"',
  });
});
