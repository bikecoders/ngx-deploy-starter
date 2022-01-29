import { ProjectConfiguration, TargetConfiguration } from '@nrwl/devkit';
import { readJson, runNxCommandAsync } from '@nrwl/nx-plugin/testing';

import { DeployExecutorOptions } from '../../../packages/ngx-deploy-npm/src/executors/deploy/schema';
import { npmAccess } from '../../../packages/ngx-deploy-npm/src/core';
import {
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from './utils';

export const installTest = () => {
  const libSet1 = 'node-lib1';
  let projectWorkSpaceLibSet1: ProjectConfiguration;

  const libSet2 = 'node-lib2';
  let projectWorkSpaceLibSet2: ProjectConfiguration;

  const libNOTset = 'node-lib-not-set';
  let projectWorkSpaceLibNOTSet: ProjectConfiguration;

  initNgxDeployNPMProject();
  installDependencies('@nrwl/node');

  // Init libs and projects
  beforeEach(async () => {
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${libSet1} --publishable --importPath ${libSet1}`
    );
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${libSet2} --publishable --importPath ${libSet2}`
    );
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${libNOTset} --publishable --importPath ${libNOTset}`
    );
  }, 360000);

  installNgxDeployNPMProject(`--projects ${libSet1},${libSet2}`);

  beforeEach(() => {
    projectWorkSpaceLibSet1 = readJson(`libs/${libSet1}/project.json`);
    projectWorkSpaceLibSet2 = readJson(`libs/${libSet2}/project.json`);
    projectWorkSpaceLibNOTSet = readJson(`libs/${libNOTset}/project.json`);
  });

  it('should modify the workspace for publishable libs', () => {
    const expectedTarget: TargetConfiguration = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.public,
      } as DeployExecutorOptions,
    };

    expect(projectWorkSpaceLibSet1.targets?.deploy).toEqual(expectedTarget);
    expect(projectWorkSpaceLibSet2.targets?.deploy).toEqual(expectedTarget);
    expect(projectWorkSpaceLibNOTSet.targets?.deploy).toEqual(undefined);
  });
};
