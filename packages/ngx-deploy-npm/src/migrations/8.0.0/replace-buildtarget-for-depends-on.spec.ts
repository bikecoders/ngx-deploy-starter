import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  ProjectConfiguration,
  TargetConfiguration,
  TargetDependencyConfig,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';

import * as mocks from '../../__mocks__/mocks';

import update, {
  DeprecatedDeployExecutorOptions,
  RemovedDeployExecutorOptions,
} from './replace-buildtarget-for-depends-on';
import { DeployExecutorOptions } from '../../executors/deploy/schema';

describe('replace-configuration-param-for-depends-on migration', () => {
  const expectedDeployTarget = (
    name: string,
    dependsOn: (TargetDependencyConfig | string)[] = []
  ): TargetConfiguration<DeployExecutorOptions> => {
    const target: TargetConfiguration<DeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        distFolderPath: `dist/libs/${name}`,
        access: 'public',
      },
    };

    if (dependsOn.length > 0) {
      target.dependsOn = dependsOn;
    }

    return target;
  };

  const setUp = (
    projects: Record<
      string,
      {
        project: ProjectConfiguration;
        config: {
          build: {
            buildConfigs?: string[];
          };
          deploy: Record<
            string,
            {
              preExistedDependsOn?: (TargetDependencyConfig | string)[];
              options?: RemovedDeployExecutorOptions;
            }
          >;
        };
      }
    >
  ) => {
    const addConfig = (
      project: ProjectConfiguration,
      config: {
        build: {
          buildConfigs?: string[];
        };
        deploy: Record<
          string,
          {
            options?: RemovedDeployExecutorOptions;
            preExistedDependsOn?: (TargetDependencyConfig | string)[];
          }
        >;
      }
    ) => {
      // Add build configs
      if (config.build.buildConfigs && project.targets?.build) {
        project.targets.build.options = {
          ...(project.targets.build.options ?? {}),
          configurations: {
            ...(project.targets.build.options.configurations ?? {}),
            ...config.build.buildConfigs,
          },
        };
      }

      // Add deploy configs
      Object.entries(config.deploy).forEach(
        ([targetKey, { options, preExistedDependsOn }]) => {
          const deployTarget: TargetConfiguration<DeprecatedDeployExecutorOptions> =
            {
              executor: 'ngx-deploy-npm:deploy',
              options: {
                distFolderPath: `dist/libs/${project.name}`,
                access: 'public',
                ...options,
              },
            };

          if (preExistedDependsOn) {
            deployTarget.dependsOn = preExistedDependsOn;
          }

          if (!project.targets) {
            project.targets = {};
          }

          project.targets[targetKey] = deployTarget;
        }
      );

      return project;
    };

    const nonMigratedProjects: Record<string, ProjectConfiguration> = {
      app: mocks.getApplication('app'),
      nonPublishable: mocks.getLibWithoutBuildTarget('nonPublishable'),
    };

    Object.entries(projects).forEach(([key, { project, config }]) => {
      nonMigratedProjects[key] = addConfig(project, config);
    });

    const tree: Tree = createTreeWithEmptyWorkspace();

    Object.entries(nonMigratedProjects).forEach(([key, projectConfig]) =>
      addProjectConfiguration(tree, key, projectConfig)
    );

    return { tree, nonMigratedProjects };
  };

  it('should migrate anything', async () => {
    const { tree } = setUp({});

    const allProjectsBeforeMigration = getProjects(tree);
    await update(tree);
    const allProjectsAfterMigration = getProjects(tree);

    expect(allProjectsBeforeMigration).toStrictEqual(allProjectsAfterMigration);
  });

  describe('Remove Deprecated Options', () => {
    const setupRemoveDep = ({
      deployConfig = [
        {
          noBuild: true,
          buildTarget: 'staging',
        },
        {
          noBuild: true,
          buildTarget: 'production',
        },
        {
          noBuild: true,
          buildTarget: 'staging',
        },
        {
          noBuild: true,
          buildTarget: 'production',
        },
      ],
    }: {
      deployConfig?: [
        RemovedDeployExecutorOptions,
        RemovedDeployExecutorOptions,
        RemovedDeployExecutorOptions,
        RemovedDeployExecutorOptions
      ];
    }) => {
      const PROJECT_NAME = 'PROJECT_NAME';
      const PROJECT_NAME2 = 'PROJECT_NAME2';

      const projectConfig = (offset = 0) => ({
        build: {
          buildConfigs: ['staging', 'production'],
        },
        deploy: {
          publishStaging: {
            options: deployConfig[offset + 0],
          },
          publishProd: {
            options: deployConfig[offset + 1],
          },
        },
      });

      const { tree } = setUp({
        PROJECT_NAME: {
          project: mocks.getLib(PROJECT_NAME),
          config: projectConfig(),
        },
        PROJECT_NAME2: {
          project: mocks.getLib(PROJECT_NAME2),
          config: projectConfig(1),
        },
      });

      const expectedDeployTargets = () => ({
        PROJECT_NAME: [
          expectedDeployTarget(PROJECT_NAME),
          expectedDeployTarget(PROJECT_NAME),
        ],
        PROJECT_NAME2: [
          expectedDeployTarget(PROJECT_NAME2),
          expectedDeployTarget(PROJECT_NAME2),
        ],
      });

      return { tree, PROJECT_NAME, PROJECT_NAME2, expectedDeployTargets };
    };

    // this is not filtering the projects with the executor
    const getAllNgxDeployNPMTargets = (tree: Tree) =>
      Array.from(getProjects(tree)).reduce((acc, [projectName, project]) => {
        const everyDeployTargets = Object.entries(project.targets ?? {})
          .filter(([, target]) => target.executor === 'ngx-deploy-npm:deploy')
          .map(
            ([, targetConfig]) =>
              targetConfig as TargetConfiguration<DeprecatedDeployExecutorOptions>
          );

        if (everyDeployTargets.length > 0) {
          acc[projectName] = everyDeployTargets;
        }

        return acc;
      }, {} as Record<string, TargetConfiguration<DeprecatedDeployExecutorOptions>[]>);

    it("should remove the `noBuild` option when it's set to `true`", async () => {
      const { tree, expectedDeployTargets } = setupRemoveDep({
        deployConfig: [
          { noBuild: true },
          { noBuild: true },
          { noBuild: true },
          { noBuild: true },
        ],
      });

      await update(tree);
      const allDeployTargets = getAllNgxDeployNPMTargets(tree);

      expect(allDeployTargets).toStrictEqual(expectedDeployTargets());
    });

    it('should remove if the target has `buildTarget` option and `noBuild` is set to `true`', async () => {
      const { tree, expectedDeployTargets } = setupRemoveDep({});

      await update(tree);
      const allDeployTargets = getAllNgxDeployNPMTargets(tree);

      expect(allDeployTargets).toStrictEqual(expectedDeployTargets());
    });
  });

  describe('Migrate Deprecated Options', () => {
    describe('`buildTarget` should be migrated to use a `dependsOn` instead', () => {
      it('should migrate anything if `noBuild` is set to true', async () => {
        const setupOptions: Parameters<typeof setUp>[0] = {
          shouldNotBeTouchedLib: {
            project: mocks.getLib('shouldNotBeTouchedLib'),
            config: {
              build: {
                buildConfigs: ['local', 'staging'],
              },
              deploy: {
                publishLocal: {
                  preExistedDependsOn: [
                    'prePublish:local',
                    { target: 'random-project:thing-to-do' },
                  ],
                  options: {
                    noBuild: true,
                    buildTarget: 'local',
                  },
                },
                publishStaging: {
                  options: {
                    noBuild: true,
                  },
                },
              },
            },
          },
          shouldNotBeTouchedLib2: {
            project: mocks.getLib('shouldNotBeTouchedLib2'),
            config: {
              build: {
                buildConfigs: ['staging', 'production'],
              },
              deploy: {
                publishLocal: {
                  preExistedDependsOn: ['prePublish:local'],
                  options: {
                    noBuild: true,
                  },
                },
              },
            },
          },
        };
        const { tree } = setUp(setupOptions);

        await update(tree);
        const allProjectsAfterMigration = getProjects(tree);

        const allDeployTargetsAfterMigration = [];
        allDeployTargetsAfterMigration.push(
          allProjectsAfterMigration.get('shouldNotBeTouchedLib')?.targets?.[
            'publishLocal'
          ],
          allProjectsAfterMigration.get('shouldNotBeTouchedLib')?.targets?.[
            'publishStaging'
          ],
          allProjectsAfterMigration.get('shouldNotBeTouchedLib2')?.targets?.[
            'publishLocal'
          ]
        );

        const expectedDeployTargets = [
          expectedDeployTarget('shouldNotBeTouchedLib', [
            'prePublish:local',
            { target: 'random-project:thing-to-do' },
          ]),
          expectedDeployTarget('shouldNotBeTouchedLib'),
          expectedDeployTarget('shouldNotBeTouchedLib2', ['prePublish:local']),
        ];

        expect(allDeployTargetsAfterMigration).toStrictEqual(
          expectedDeployTargets
        );
      });

      it('should migration put the `dependsOn` for packages that are being built', async () => {
        const setupOptions: Parameters<typeof setUp>[0] = {
          shouldCreateDependsOn: {
            project: mocks.getLib('shouldCreateDependsOn'),
            config: {
              build: {
                buildConfigs: ['local', 'staging'],
              },
              deploy: {
                publishLocal: {
                  preExistedDependsOn: ['existingDependsOn'],
                  options: {
                    noBuild: false,
                  },
                },
                publishStaging: {
                  options: {
                    noBuild: undefined,
                  },
                },
              },
            },
          },
        };
        const { tree } = setUp(setupOptions);

        await update(tree);
        const allProjectsAfterMigration = getProjects(tree);

        const allTargetsAfterMigration: Record<
          string,
          TargetConfiguration<unknown | DeployExecutorOptions> | undefined
        > = {
          publishLocal: allProjectsAfterMigration.get('shouldCreateDependsOn')
            ?.targets?.['publishLocal'],
          publishStaging: allProjectsAfterMigration.get('shouldCreateDependsOn')
            ?.targets?.['publishStaging'],
        };

        const expectedDeployTargets: Record<
          string,
          TargetConfiguration<unknown | DeployExecutorOptions> | undefined
        > = {
          publishLocal: expectedDeployTarget('shouldCreateDependsOn', [
            'existingDependsOn',
            'build',
          ]),
          publishStaging: expectedDeployTarget('shouldCreateDependsOn', [
            'build',
          ]),
        };

        expect(allTargetsAfterMigration).toStrictEqual(expectedDeployTargets);
      });

      it('should create a pre-deploy target when the option `buildTarget` is present', async () => {
        const setupOptions: Parameters<typeof setUp>[0] = {
          shouldCreateDependsOn: {
            project: mocks.getLib('shouldCreateDependsOn'),
            config: {
              build: {
                buildConfigs: ['local', 'staging'],
              },
              deploy: {
                publishLocal: {
                  preExistedDependsOn: ['existingPrePublish-local'],
                  options: {
                    noBuild: false,
                    buildTarget: 'local',
                  },
                },
                publishStaging: {
                  options: {
                    noBuild: undefined,
                    buildTarget: 'staging',
                  },
                },
              },
            },
          },
        };
        const { tree } = setUp(setupOptions);

        await update(tree);
        const allProjectsAfterMigration = getProjects(tree);

        const allTargetsAfterMigration: Record<
          string,
          TargetConfiguration<unknown | DeployExecutorOptions> | undefined
        > = {
          'pre-publishLocal-build-local': allProjectsAfterMigration.get(
            'shouldCreateDependsOn'
          )?.targets?.['pre-publishLocal-build-local'],
          'pre-publishStaging-build-staging': allProjectsAfterMigration.get(
            'shouldCreateDependsOn'
          )?.targets?.['pre-publishStaging-build-staging'],
          publishLocal: allProjectsAfterMigration.get('shouldCreateDependsOn')
            ?.targets?.['publishLocal'],
          publishStaging: allProjectsAfterMigration.get('shouldCreateDependsOn')
            ?.targets?.['publishStaging'],
        };

        const expectedDeployTargets: Record<
          string,
          TargetConfiguration<unknown | DeployExecutorOptions> | undefined
        > = {
          'pre-publishLocal-build-local': {
            executor: 'nx:run-commands',
            options: {
              command: `nx run shouldCreateDependsOn:build:local`,
            },
          },
          'pre-publishStaging-build-staging': {
            executor: 'nx:run-commands',
            options: {
              command: `nx run shouldCreateDependsOn:build:staging`,
            },
          },
          publishLocal: expectedDeployTarget('shouldCreateDependsOn', [
            'existingPrePublish-local',
            'pre-publishLocal-build-local',
          ]),
          publishStaging: expectedDeployTarget('shouldCreateDependsOn', [
            'pre-publishStaging-build-staging',
          ]),
        };

        expect(allTargetsAfterMigration).toStrictEqual(expectedDeployTargets);
      });
    });
  });
});
