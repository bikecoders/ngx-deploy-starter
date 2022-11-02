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
  const publicLib = 'node-lib1';
  let projectWorkSpacepublicLib: ProjectConfiguration;

  const publicLib2 = 'node-lib2';
  let projectWorkSpacePublicLib2: ProjectConfiguration;

  const resctrictedLib = 'node-resctricted';
  let projectWorkSpaceRestrictedLib: ProjectConfiguration;

  const libNOTset = 'node-lib-not-set';
  let projectWorkSpaceLibNOTSet: ProjectConfiguration;

  initNgxDeployNPMProject();
  installDependencies('@nrwl/node');

  // Init libs and projects
  beforeEach(async () => {
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${publicLib} --publishable --importPath ${publicLib}`
    );
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${publicLib2} --publishable --importPath ${publicLib2}`
    );
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${resctrictedLib} --publishable --importPath ${resctrictedLib}`
    );
    await runNxCommandAsync(
      `generate @nrwl/node:lib --name ${libNOTset} --publishable --importPath ${libNOTset}`
    );
  }, 360000);

  installNgxDeployNPMProject(`--projects ${publicLib},${publicLib2}`);

  installNgxDeployNPMProject(
    `--projects ${resctrictedLib} --access ${npmAccess.restricted}`
  );

  beforeEach(() => {
    projectWorkSpacepublicLib = readJson(`libs/${publicLib}/project.json`);
    projectWorkSpacePublicLib2 = readJson(`libs/${publicLib2}/project.json`);
    projectWorkSpaceRestrictedLib = readJson(
      `libs/${resctrictedLib}/project.json`
    );
    projectWorkSpaceLibNOTSet = readJson(`libs/${libNOTset}/project.json`);
  });

  it('should modify the workspace for publishable libs', () => {
    const expectedPublicTarget: TargetConfiguration = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.public,
      } as DeployExecutorOptions,
    };

    const expectedRestrictedTarget: TargetConfiguration = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.restricted,
      } as DeployExecutorOptions,
    };

    expect(projectWorkSpacepublicLib.targets?.deploy).toEqual(
      expectedPublicTarget
    );
    expect(projectWorkSpacePublicLib2.targets?.deploy).toEqual(
      expectedPublicTarget
    );
    expect(projectWorkSpaceRestrictedLib.targets?.deploy).toEqual(
      expectedRestrictedTarget
    );
    expect(projectWorkSpaceLibNOTSet.targets?.deploy).toEqual(undefined);
  });
};
