import {
  TargetConfiguration,
  Tree,
  formatFiles,
  getProjects,
  updateProjectConfiguration,
  logger,
} from '@nx/devkit';
import { DeployExecutorOptions } from '../../executors/deploy/schema';

export type DeprecatedDeployExecutorOptions = Omit<
  DeployExecutorOptions,
  'distFolderPath'
> & { distFolderPath?: string };

const targetNeedsMigration = (
  target: TargetConfiguration<DeprecatedDeployExecutorOptions>
) =>
  target.executor === 'ngx-deploy-npm:deploy' &&
  target.options?.distFolderPath === undefined;

export default async function update(host: Tree) {
  const projectToMigrate = Array.from(getProjects(host))
    // remove projects that doesn't have the our executor or already have the option distFolderPath
    .filter(([, project]) => {
      const projectTargets: TargetConfiguration<DeprecatedDeployExecutorOptions>[] =
        Object.values(project.targets ?? {});
      return projectTargets.some(targetNeedsMigration);
    });

  projectToMigrate.forEach(([projectKey, project]) => {
    if (project.name === undefined) {
      logger.warn(
        `Project ${projectKey} doesn't have a name\nIt was skipped, you will need to create the option distFolderPath manually`
      );
      return;
    }

    // Create the distFolderPath option
    Object.values(project.targets ?? {})
      .filter(targetNeedsMigration)
      .forEach(deployTarget => {
        deployTarget.options.distFolderPath = `dist/${project.root}`;
      });
    updateProjectConfiguration(host, project.name, project);
  });

  await formatFiles(host);
}
