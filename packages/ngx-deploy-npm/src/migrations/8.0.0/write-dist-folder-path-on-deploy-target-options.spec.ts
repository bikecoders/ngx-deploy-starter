import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';
import * as mocks from '../../__mocks__/mocks';

import update, {
  DeprecatedDeployExecutorOptions,
} from './write-dist-folder-path-on-deploy-target-options';

describe('write-dist-folder-path-on-deploy-target-options migration', () => {
  const setUp = () => {
    const addTargets = (
      project: ProjectConfiguration,
      addDistFolderPathOption = true
    ) => {
      if (!project.targets) {
        project.targets = {};
      }

      const deployTarget: TargetConfiguration<DeprecatedDeployExecutorOptions> =
        {
          executor: 'ngx-deploy-npm:deploy',
          options: {
            distFolderPath: addDistFolderPathOption
              ? `dist/libs/${project.name}`
              : undefined,
            access: 'public',
          },
        };

      project.targets.deploy = deployTarget;
      project.targets.publish = deployTarget;

      return project;
    };

    const nonMigratedProjects: Record<string, ProjectConfiguration> = {
      WITH_distFolderPathOption: addTargets(
        mocks.getLib('WITH_distFolderPathOption')
      ),
      WITHOUT_distFolderPathOption1: addTargets(
        mocks.getLib('WITHOUT_distFolderPathOption1'),
        false
      ),
      WITHOUT_distFolderPathOption2: addTargets(
        mocks.getLib('WITHOUT_distFolderPathOption2'),
        false
      ),

      app: mocks.getApplication('app'),
      nonPublishable: mocks.getLibWithoutBuildTarget('nonPublishable'),
    };

    const tree: Tree = createTreeWithEmptyWorkspace();

    Object.entries(nonMigratedProjects).forEach(([key, projectConfig]) =>
      addProjectConfiguration(tree, key, projectConfig)
    );

    return { tree, nonMigratedProjects };
  };

  it('should set up the distFolderPath option on the right projects', async () => {
    const { tree } = setUp();

    await update(tree);

    const allProjects = getProjects(tree);
    const WITHOUT_distFolderPathOption1 = allProjects.get(
      'WITHOUT_distFolderPathOption1'
    );
    const WITHOUT_distFolderPathOption2 = allProjects.get(
      'WITHOUT_distFolderPathOption2'
    );

    expect(
      WITHOUT_distFolderPathOption1?.targets?.deploy.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption1?.targets?.publish.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption2?.targets?.deploy.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption2?.targets?.publish.options.distFolderPath
    ).toBeTruthy();
  });

  it('should set up the distFolderPath option with the right value', async () => {
    const { tree } = setUp();

    await update(tree);

    const allProjects = getProjects(tree);
    const WITHOUT_distFolderPathOption1 = allProjects.get(
      'WITHOUT_distFolderPathOption1'
    );

    expect(
      WITHOUT_distFolderPathOption1?.targets?.deploy.options.distFolderPath
    ).toStrictEqual(`dist/libs/${WITHOUT_distFolderPathOption1?.name ?? ''}`);
    expect(
      WITHOUT_distFolderPathOption1?.targets?.publish.options.distFolderPath
    ).toStrictEqual(`dist/libs/${WITHOUT_distFolderPathOption1?.name ?? ''}`);
  });

  it('should not touch other projects', async () => {
    const { tree } = setUp();
    const getNonMigratedProjects = (tree: Tree) => {
      const allProjects = getProjects(tree);
      return {
        projectBefore: allProjects.get('projectBefore'),
        WITH_distFolderPathOption: allProjects.get('WITH_distFolderPathOption'),
        app: allProjects.get('app'),
        nonPublishable: allProjects.get('nonPublishable'),
      };
    };
    const nonMigratedProjectsBefore = getNonMigratedProjects(tree);

    await update(tree);

    const nonMigratedProjectsAfter = getNonMigratedProjects(tree);

    expect(nonMigratedProjectsBefore).toStrictEqual(nonMigratedProjectsAfter);
  });
});
