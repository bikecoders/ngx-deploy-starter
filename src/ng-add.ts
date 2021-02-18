import { JsonParseMode, parseJson } from '@angular-devkit/core';
import {
  SchematicsException,
  Tree,
  SchematicContext
} from '@angular-devkit/schematics';

import { npmAccess } from './engine/defaults';
import { Workspace, WorkspaceProject } from 'interfaces';

function getWorkspace(host: Tree): { path: string; workspace: Workspace } {
  const possibleFiles = ['/angular.json', '/.angular.json', '/workspace.json'];
  const path = possibleFiles.filter(path => host.exists(path))[0];

  const configBuffer = host.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find workspace definition`);
  }
  const content = configBuffer.toString();

  let workspace: Workspace;
  try {
    workspace = (parseJson(content, JsonParseMode.Loose) as {}) as Workspace;
  } catch (e) {
    throw new SchematicsException(`Could not parse workspace definition: ` + e.message);
  }

  return {
    path,
    workspace
  };
}

interface INgAddOptions {}

export const ngAdd = (options?: INgAddOptions) => (
  tree: Tree,
  _context: SchematicContext
) => {
  const { path: workspacePath, workspace } = getWorkspace(tree);

  const libraries = getLibraries(workspace);

  // If there is no libraries to install throw an exception
  if (libraries.length === 0) {
    throw new SchematicsException('There is no libraries to add this deployer');
  }

  libraries.forEach(lib => {
    /* istanbul ignore else */
    if (lib.architect) {
      lib.architect['deploy'] = {
        builder: 'ngx-deploy-npm:deploy',
        options: {
          access: npmAccess.public
        }
      };
    }
  });

  tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2));
  return tree;
};

/**
 * Get the libraries present in the workspace
 * @param workspace
 */
function getLibraries({ projects }: Workspace): WorkspaceProject[] {
  return (
    Object.keys(projects)
      .map(projectKey => projects[projectKey])
      // Check if the library is a publishable library (nx compatibility)
      .filter(
        proj =>
          proj.projectType === 'library' &&
          proj.architect &&
          proj.architect.build
      )
  );
}
