import { Tree, SchematicContext } from '@angular-devkit/schematics';

import { ngAdd } from './ng-add';
import { Workspace } from 'interfaces';

describe('ng-add', () => {
  let originalWorkspaceDefinition: Workspace;
  let expectedWorkspaceDefinition: Workspace;

  beforeEach(() => {
    originalWorkspaceDefinition = {
      projects: {
        testing: {
          projectType: 'application',
          architect: {
            build: {
              builder: 'a',
              options: { b: 'b' }
            }
          }
        },
        publishable: {
          projectType: 'library',
          architect: {
            build: {
              builder: '@angular-devkit/build-ng-packagr:build',
              options: { a: 'a', b: 'b' }
            }
          }
        },
        publishable2: {
          projectType: 'library',
          architect: {
            build: {
              builder: 'my-custom-builder',
              options: {
                a: 'a',
                b: 'b'
              }
            }
          }
        },
        'non-publishable': {
          projectType: 'library',
          architect: {
            lint: {
              builder: 'a',
              options: {
                b: 'b'
              }
            }
          }
        },
        'non-publishable2': {
          projectType: 'library',
          architect: {
            lint: {
              builder: 'a',
              options: {
                b: 'b'
              }
            }
          }
        }
      },
      defaultProject: 'testing'
    };

    expectedWorkspaceDefinition = JSON.parse(
      JSON.stringify(originalWorkspaceDefinition)
    );

    ['publishable', 'publishable2']
      .map(
        publishableProjectKey =>
          expectedWorkspaceDefinition.projects[publishableProjectKey]
      )
      .forEach(project => {
        if (project.architect) {
          project.architect.deploy = {
            builder: 'ngx-deploy-npm:deploy',
            options: {
              access: 'public'
            }
          };
        }
      });
  });

  describe('generating files', () => {
    let tree: Tree;

    beforeEach(() => {
      tree = Tree.empty();
    });

    it('should set the deployer only on publishable libraries using angular.json', () => {
      tree.create('angular.json', JSON.stringify(originalWorkspaceDefinition));

      const result = ngAdd()(tree, {} as SchematicContext);

      const angularJsonModified = JSON.parse(
        result.read('angular.json')!.toString()
      );

      expect(angularJsonModified).toEqual(expectedWorkspaceDefinition);
    });

    it('should set the deployer only on publishable libraries using workspace.json', () => {
      tree.create(
        'workspace.json',
        JSON.stringify(originalWorkspaceDefinition)
      );

      const result = ngAdd()(tree, {} as SchematicContext);

      const workspaceJsonModified = JSON.parse(
        result.read('workspace.json')!.toString()
      );

      expect(workspaceJsonModified).toEqual(expectedWorkspaceDefinition);
    });
  });

  describe('error handling', () => {
    it('Should throw if workspace definition not found', () => {
      expect(() => ngAdd()(Tree.empty(), {} as SchematicContext)).toThrowError(
        'Could not find workspace definition'
      );
    });

    it('Should throw if workspace definition can not be parsed', () => {
      const tree = Tree.empty();
      tree.create('angular.json', 'hi');
      expect(() => ngAdd()(tree, {} as SchematicContext)).toThrowError(
        'Could not parse workspace definition'
      );
    });

    it('Should throw if workspace definition can not be parsed', () => {
      expect(() => ngAdd()(Tree.empty(), {} as SchematicContext)).toThrowError(
        'Could not find workspace definition'
      );
    });

    it('should throw if there is no library to add the deployer', () => {
      // Delete all libraries
      Object.keys(originalWorkspaceDefinition.projects)
        .filter(
          projectKey =>
            originalWorkspaceDefinition.projects[projectKey].projectType ===
            'library'
        )
        .forEach(libraryKey => {
          delete originalWorkspaceDefinition.projects[libraryKey];
        });
      const treeWithoutLibs = Tree.empty();
      treeWithoutLibs.create(
        'angular.json',
        JSON.stringify(originalWorkspaceDefinition)
      );

      expect(() =>
        ngAdd()(treeWithoutLibs, {} as SchematicContext)
      ).toThrowError('There is no libraries to add this deployer');
    });
  });
});
