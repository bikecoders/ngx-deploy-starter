import { initNgxDeployNPMProject, basicSetTestForLibs } from '../utils';

describe('Publish', () => {
  initNgxDeployNPMProject();

  describe('Basic deploy test for Angular Libs', () => {
    const libName = 'angular-lib';
    const nxPlugin = '@nrwl/angular';

    basicSetTestForLibs(libName, nxPlugin, {
      libGeneratorCommandOptions: '--style css',
    });
  });

  describe('Basic deploy test for Node Libs', () => {
    const libName = 'node-lib';
    const nxPlugin = '@nrwl/node';

    basicSetTestForLibs(libName, nxPlugin);
  });
});
