import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  addProjectConfiguration,
  ProjectConfiguration,
  getProjects,
  TargetConfiguration,
} from '@nrwl/devkit';

import generator from './generator';
import { InstallGeneratorOptions } from './schema';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import { npmAccess } from '../../core';
import { buildInvalidProjectsErrorMessage } from './utils';

describe('install/ng-add generator', () => {
  let appTree: Tree;
  let options: InstallGeneratorOptions;

  type publishableLibConfig = {
    key: string;
    projectConfig: ProjectConfiguration;
  };

  let workspaceConfig: Map<string, ProjectConfiguration>;
  let libPublisable: publishableLibConfig;
  let libPublisable2: publishableLibConfig;
  let libPublisableWithProdMode: publishableLibConfig;
  let expectedSimpleTarget: TargetConfiguration;
  let expectedTargetWithProductionMode: TargetConfiguration;

  const createWorkspace = () =>
    Array.from(workspaceConfig.entries()).forEach(([key, projectConfig]) =>
      addProjectConfiguration(appTree, key, projectConfig)
    );

  beforeEach(() => {
    options = {};

    appTree = createTreeWithEmptyWorkspace();
  });

  beforeEach(() => {
    workspaceConfig = new Map();

    libPublisable = {
      key: 'libPublisable',
      projectConfig: {
        root: '',
        projectType: 'library',
        targets: {
          build: {
            executor: '@angular-devkit/build-ng-packagr:build',
            options: { a: 'a', b: 'b' },
          },
        },
      },
    };

    libPublisable2 = {
      key: 'libPublisable2',
      projectConfig: JSON.parse(JSON.stringify(libPublisable.projectConfig)),
    };

    libPublisableWithProdMode = {
      key: 'libPublisablWithProd',
      projectConfig: {
        root: '',
        projectType: 'library',
        targets: {
          build: {
            executor: 'my-custom-builder',
            options: {
              a: 'a',
              b: 'b',
            },
            configurations: {
              production: {},
            },
          },
        },
      },
    };

    workspaceConfig.set(libPublisable.key, libPublisable.projectConfig);
    workspaceConfig.set(libPublisable2.key, libPublisable2.projectConfig);
    workspaceConfig.set(
      libPublisableWithProdMode.key,
      libPublisableWithProdMode.projectConfig
    );
  });

  describe('generating files', () => {
    beforeEach(() => {
      expectedSimpleTarget = {
        executor: 'ngx-deploy-npm:deploy',
        options: {
          access: npmAccess.public,
        } as DeployExecutorOptions,
      };

      expectedTargetWithProductionMode = {
        executor: 'ngx-deploy-npm:deploy',
        options: {
          buildTarget: 'production',
          access: npmAccess.public,
        } as DeployExecutorOptions,
      };

      workspaceConfig.set('project', {
        root: '',
        projectType: 'application',
        targets: {
          build: {
            executor: 'a',
            options: { b: 'b' },
          },
        },
      });
      workspaceConfig.set('non-publishable', {
        root: '',
        projectType: 'library',
        targets: {
          lint: {
            executor: 'a',
            options: {
              b: 'b',
            },
          },
        },
      });
      workspaceConfig.set('non-publishable2', {
        root: '',
        projectType: 'library',
        targets: {
          lint: {
            executor: 'a',
            options: {
              b: 'b',
            },
          },
        },
      });
    });

    // create workspace
    beforeEach(createWorkspace);

    describe('default Options', () => {
      // install
      beforeEach(async () => {
        await generator(appTree, options);
      });

      it('should set the deployer only on publishable libraries', async () => {
        const allProjects = getProjects(appTree);

        const projectsAffected = Array.from(allProjects.entries())
          .filter(([, config]) => !!config.targets?.deploy)
          .map(([key]) => key);

        expect(projectsAffected.sort()).toEqual(
          [
            libPublisable.key,
            libPublisable2.key,
            libPublisableWithProdMode.key,
          ].sort()
        );
      });

      it('should create the target with the right structure for simple libs', () => {
        const allProjects = getProjects(appTree);
        const config = allProjects.get(libPublisable.key);

        const targetDeploy = config?.targets?.deploy;

        expect(targetDeploy).toEqual(expectedSimpleTarget);
      });

      it('should create the target with the right configuration for libs with prod configuration', () => {
        const allProjects = getProjects(appTree);
        const config = allProjects.get(libPublisableWithProdMode.key);

        const targetDeploy = config?.targets?.deploy;

        expect(targetDeploy).toEqual(expectedTargetWithProductionMode);
      });
    });

    describe('--projects', () => {
      it('should add config only to specified projects', async () => {
        options = {
          projects: [libPublisable.key, libPublisable2.key],
        };
        // install
        await generator(appTree, options);
        const allProjects = getProjects(appTree);

        const projectsAffected = Array.from(allProjects.entries())
          .filter(([, config]) => !!config.targets?.deploy)
          .map(([key]) => key);

        expect(projectsAffected.sort()).toEqual(
          [libPublisable.key, libPublisable2.key].sort()
        );
      });

      it('should add config to all projects if --projects option is empty', async () => {
        options = {
          projects: [],
        };
        // install
        await generator(appTree, options);
        const allProjects = getProjects(appTree);

        const projectsAffected = Array.from(allProjects.entries())
          .filter(([, config]) => !!config.targets?.deploy)
          .map(([key]) => key);

        expect(projectsAffected.sort()).toEqual(
          [
            libPublisable.key,
            libPublisable2.key,
            libPublisableWithProdMode.key,
          ].sort()
        );
      });
    });
  });

  describe('error handling', () => {
    it('should throw an error if there is no publishable library', () => {
      expect(generator(appTree, options)).rejects.toEqual(
        new Error('There is no publishable libraries in this workspace')
      );
    });

    it('should throw an error if invalid projects are pass on --projects', () => {
      const invalidProjects = ['i', 'dont', 'exists'];
      options = {
        projects: [libPublisable.key, ...invalidProjects],
      };
      createWorkspace();

      expect(generator(appTree, options)).rejects.toEqual(
        new Error(buildInvalidProjectsErrorMessage(invalidProjects))
      );
    });
  });
});
