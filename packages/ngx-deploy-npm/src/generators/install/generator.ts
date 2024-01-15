import {
  getProjects,
  formatFiles,
  updateProjectConfiguration,
} from '@nx/devkit';
import type { Tree } from '@nx/devkit';

import type { InstallGeneratorOptions } from './schema';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import { isProjectAPublishableLib } from '../../utils';

export default async function install(
  tree: Tree,
  rawOptions: InstallGeneratorOptions
) {
  const options = rawOptions;

  const selectedLib = getProjects(tree).get(options.project);

  if (selectedLib === undefined) {
    throw new Error(
      `The project ${options.project} doesn't exist on your workspace`
    );
  }

  if ((await isProjectAPublishableLib(selectedLib)) === false) {
    throw new Error(
      `The project ${options.project} is not a publishable library`
    );
  }

  const executorOptions: DeployExecutorOptions = {
    distFolderPath: options.distFolderPath,
    access: options.access,
  };

  // Create targets in case that they doesn't already exists
  if (!selectedLib.targets) {
    selectedLib.targets = {};
  }

  selectedLib.targets.deploy = {
    executor: 'ngx-deploy-npm:deploy',
    options: executorOptions,
    ...(selectedLib.targets.build ? { dependsOn: ['build'] } : {}),
  };

  updateProjectConfiguration(tree, options.project, selectedLib);

  await formatFiles(tree);
}
