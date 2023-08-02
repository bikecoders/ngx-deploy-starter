import { ProjectConfiguration, TargetConfiguration } from '@nx/devkit';
import { readJson } from '@nx/plugin/testing';

import { DeployExecutorOptions } from '../../../packages/ngx-deploy-npm/src/executors/deploy/schema';
import { npmAccess } from '../../../packages/ngx-deploy-npm/src/core';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '../utils';

// TODO, migrate to SIFERS
describe('install', () => {
  const publicLib = 'node-lib1';
  let projectWorkSpacePublicLib: ProjectConfiguration;

  const publicLib2 = 'node-lib2';
  let projectWorkSpacePublicLib2: ProjectConfiguration;

  const restrictedLib = 'node-resctricted';
  let projectWorkSpaceRestrictedLib: ProjectConfiguration;

  const libNOTset = 'node-lib-not-set';
  let projectWorkSpaceLibNOTSet: ProjectConfiguration;

  const expectedTarget = (
    projectName: string,
    isBuildable = true,
    access: npmAccess = npmAccess.public
  ): TargetConfiguration<DeployExecutorOptions> => {
    const target: TargetConfiguration<DeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        distFolderPath: `dist/libs/${projectName}`,
        access: access,
      },
    };

    if (isBuildable) {
      target.dependsOn = ['build'];
    }

    return target;
  };

  initNgxDeployNPMProject();
  installDependencies('@nx/node');

  // Init libs and projects
  generateLib('@nx/node', publicLib, `--dir="libs"`);
  generateLib('@nx/node', publicLib2, `--dir="libs"`);
  generateLib('@nx/node', restrictedLib, `--dir="libs"`);
  generateLib('@nx/node', libNOTset, `--dir="libs"`);

  const buildMockDistPath = (projectName: string) => {
    return `dist/libs/${projectName}`;
  };

  installNgxDeployNPMProject(
    `--project ${publicLib} --dist-folder-path="${buildMockDistPath(
      publicLib
    )}"`
  );
  installNgxDeployNPMProject(
    `--project ${publicLib2} --dist-folder-path="${buildMockDistPath(
      publicLib2
    )}"`
  );
  installNgxDeployNPMProject(
    `--project=${restrictedLib} --dist-folder-path="${buildMockDistPath(
      restrictedLib
    )}" --access ${npmAccess.restricted}`
  );

  beforeEach(() => {
    projectWorkSpacePublicLib = readJson(`libs/${publicLib}/project.json`);
    projectWorkSpacePublicLib2 = readJson(`libs/${publicLib2}/project.json`);
    projectWorkSpaceRestrictedLib = readJson(
      `libs/${restrictedLib}/project.json`
    );
    projectWorkSpaceLibNOTSet = readJson(`libs/${libNOTset}/project.json`);
  });

  it('should modify the workspace for publishable libs', () => {
    expect(projectWorkSpacePublicLib.targets?.deploy).toEqual(
      expectedTarget(publicLib)
    );
    expect(projectWorkSpacePublicLib2.targets?.deploy).toEqual(
      expectedTarget(publicLib2)
    );
    expect(projectWorkSpaceRestrictedLib.targets?.deploy).toEqual(
      expectedTarget(restrictedLib, true, npmAccess.restricted)
    );
    expect(projectWorkSpaceLibNOTSet.targets?.deploy).toEqual(undefined);
  });
});
