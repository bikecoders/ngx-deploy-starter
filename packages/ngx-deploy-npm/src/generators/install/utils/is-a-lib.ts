import { ProjectConfiguration } from '@nrwl/devkit';

export const isProjectAPublishableLib = (
  project: ProjectConfiguration
): boolean => {
  return (
    isPublishableProjectTypeLibray(project) ||
    doesntHaveProjectTypeLibButIsPublishableLib(project)
  );
};

function isPublishableProjectTypeLibray(project: ProjectConfiguration) {
  return project.projectType === 'library' && isBuildable(project);
}

function doesntHaveProjectTypeLibButIsPublishableLib(
  project: ProjectConfiguration
) {
  return (
    project.projectType === undefined &&
    isBuildable(project) &&
    typeof project?.targets?.build.options.main === 'string'
  );
}

function isBuildable(project: ProjectConfiguration) {
  return typeof project.targets?.build === 'object';
}
