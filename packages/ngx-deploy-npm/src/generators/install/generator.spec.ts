import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  Tree,
  addProjectConfiguration,
  ProjectConfiguration,
  getProjects,
  TargetConfiguration,
} from '@nx/devkit';

import generator from './generator';
import { InstallGeneratorOptions } from './schema';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import { npmAccess } from '../../core';
import { buildInvalidProjectsErrorMessage } from './utils';
import {
  getApplication,
  getLibPublishable,
  getLibPublishableWithProdMode,
  getNonPublishableLib,
  getLibWithNoSpecification,
} from '../../__mocks__/generators';

describe('install/ng-add generator', () => {
  let appTree: Tree;
  let rawOptions: InstallGeneratorOptions;

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
    rawOptions = {};

    appTree = createTreeWithEmptyWorkspace();
  });

  beforeEach(() => {
    workspaceConfig = new Map();

    libPublisable = {
      key: 'libPublishable1',
      projectConfig: getLibPublishable('libPublishable1'),
    };

    libPublisable2 = {
      key: 'libPublishableWithNoSpecification',
      projectConfig: getLibWithNoSpecification(
        'libPublishableWithNoSpecification'
      ),
    };

    libPublisableWithProdMode = {
      key: 'libPublisableWithProd',
      projectConfig: getLibPublishableWithProdMode('libPublisableWithProd'),
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

      workspaceConfig.set('project', getApplication('project'));
      workspaceConfig.set(
        'non-publishable',
        getNonPublishableLib('non-publishable')
      );
      workspaceConfig.set(
        'non-publishable2',
        getNonPublishableLib('non-publishable2')
      );
    });

    // create workspace
    beforeEach(createWorkspace);

    describe('default Options', () => {
      // install
      beforeEach(async () => {
        await generator(appTree, rawOptions);
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

      it('should set the `access` option as `public` by default', async () => {
        const allProjects = getProjects(appTree);
        const project = allProjects.get(libPublisable.key);

        const setOptions: InstallGeneratorOptions =
          project?.targets?.deploy.options;

        expect(setOptions.access).toEqual(npmAccess.public);
      });
    });

    describe('--projects', () => {
      it('should add config only to specified projects', async () => {
        rawOptions = {
          projects: [libPublisable.key, libPublisable2.key],
        };
        // install
        await generator(appTree, rawOptions);
        const allProjects = getProjects(appTree);

        const projectsAffected = Array.from(allProjects.entries())
          .filter(([, config]) => !!config.targets?.deploy)
          .map(([key]) => key);

        expect(projectsAffected.sort()).toEqual(
          [libPublisable.key, libPublisable2.key].sort()
        );
      });

      it('should add config to all projects if --projects option is empty', async () => {
        rawOptions = {
          projects: [],
        };
        // install
        await generator(appTree, rawOptions);
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

    describe('--access', () => {
      it('should set the `access` option as `public` when is set to `public` on rawoption', async () => {
        rawOptions = {
          projects: [libPublisable.key],
          access: npmAccess.public,
        };
        // install
        await generator(appTree, rawOptions);

        const allProjects = getProjects(appTree);
        const project = allProjects.get(libPublisable.key);

        const setOptions: InstallGeneratorOptions =
          project?.targets?.deploy.options;

        expect(setOptions.access).toEqual(npmAccess.public);
      });

      it('should set the `access` option as `public` when is set to `restricted` on rawoption', async () => {
        rawOptions = {
          projects: [libPublisable.key],
          access: npmAccess.restricted,
        };
        // install
        await generator(appTree, rawOptions);

        const allProjects = getProjects(appTree);
        const project = allProjects.get(libPublisable.key);

        const setOptions: InstallGeneratorOptions =
          project?.targets?.deploy.options;

        expect(setOptions.access).toEqual(npmAccess.restricted);
      });
    });
  });

  describe('error handling', () => {
    it('should throw an error if there is no publishable library', () => {
      expect(generator(appTree, rawOptions)).rejects.toEqual(
        new Error('There is no publishable libraries in this workspace')
      );
    });

    it('should throw an error if invalid projects are pass on --projects', () => {
      const invalidProjects = ['i', 'dont', 'exists'];
      rawOptions = {
        projects: [libPublisable.key, ...invalidProjects],
      };
      createWorkspace();

      expect(generator(appTree, rawOptions)).rejects.toEqual(
        new Error(buildInvalidProjectsErrorMessage(invalidProjects))
      );
    });
  });
});
