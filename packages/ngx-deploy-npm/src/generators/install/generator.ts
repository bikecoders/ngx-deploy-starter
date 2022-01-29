import {
  getProjects,
  formatFiles,
  updateProjectConfiguration,
  ProjectConfiguration,
} from '@nrwl/devkit';
import type { Tree } from '@nrwl/devkit';

import type { InstallGeneratorOptions } from './schema';
import { npmAccess } from '../../core';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import {
  allProjectsAreValid,
  buildInvalidProjectsErrorMessage,
  determineWhichProjectsAreInvalid,
} from './utils';

export default async function install(
  tree: Tree,
  options: InstallGeneratorOptions
) {
  let libs = getBuildableLibraries(tree);

  // If there is no libraries to install throw an exception
  if (libs.size === 0) {
    throw new Error('There is no publishable libraries in this workspace');
  }

  if (options.projects && options.projects.length > 0) {
    // if there is projects that doesn't exists, throw an error indicating which projects are invalid
    if (!allProjectsAreValid(options.projects, libs)) {
      const invalidProjects = determineWhichProjectsAreInvalid(
        options.projects,
        libs
      );

      throw new Error(buildInvalidProjectsErrorMessage(invalidProjects));
    }

    const selectedLibs = new Map<string, ProjectConfiguration>();
    options.projects.forEach(project => {
      const lib = libs.get(project);

      if (lib) {
        selectedLibs.set(project, lib);
      }
    });

    libs = selectedLibs;
  }

  Array.from(libs.entries()).forEach(([libKey, libConfig]) => {
    if (libConfig.targets) {
      const executorOptions: DeployExecutorOptions = {
        access: npmAccess.public,
        ...setUpProductionModeIfHasIt(libConfig),
      };

      libConfig.targets.deploy = {
        executor: 'ngx-deploy-npm:deploy',
        options: executorOptions,
      };

      updateProjectConfiguration(tree, libKey, libConfig);
    }
  });

  /* Supports Angular CLI workspace definition format, see https://github.com/nrwl/nx/discussions/6955#discussioncomment-1341893 */
  await formatFiles(tree);
}

/**
 * Get the libraries present in the workspace
 * @param workspace
 */
function getBuildableLibraries(tree: Tree): ReturnType<typeof getProjects> {
  const allProjects = getProjects(tree);

  Array.from(allProjects.entries())
    .filter(
      ([, project]) =>
        project.projectType !== 'library' || !project.targets?.build
    )
    .forEach(([key]) => allProjects.delete(key));

  return allProjects;
}

/**
 * Returns the configuration production if the library has a production mode on its build
 * @param lib The workspace of the library
 */
function setUpProductionModeIfHasIt(
  lib: ProjectConfiguration
): Pick<DeployExecutorOptions, 'buildTarget'> {
  return lib.targets?.build?.configurations?.production
    ? {
        buildTarget: 'production',
      }
    : {};
}
