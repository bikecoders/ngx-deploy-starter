import { getProjects } from '@nrwl/devkit';

export function allProjectsAreValid(
  projects: string[],
  allLibs: ReturnType<typeof getProjects>
): boolean {
  return projects.every(project => !!allLibs.get(project));
}

export function determineWhichProjectsAreInvalid(
  projects: string[],
  allLibs: ReturnType<typeof getProjects>
): string[] {
  return projects.filter(project => !allLibs.get(project));
}

export function buildInvalidProjectsErrorMessage(
  invalidProjects: string[]
): string {
  return `There are libraries that doesn't exits on this workspace: ${invalidProjects.join(
    ', '
  )}`;
}
