import { ProjectConfiguration } from '@nx/devkit';
import { fileExists } from './file-utils';
import * as path from 'path';

export const isProjectAPublishableLib = async (
  project: ProjectConfiguration
): Promise<boolean> => {
  return (
    project.projectType === 'library' && (await hasProjectJsonFile(project))
  );
};

function hasProjectJsonFile(project: ProjectConfiguration): Promise<boolean> {
  return fileExists(path.join(project.root, 'package.json'));
}
