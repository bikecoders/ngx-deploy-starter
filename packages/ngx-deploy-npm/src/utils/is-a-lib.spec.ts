import { isProjectAPublishableLib } from './is-a-lib';
import * as fileUtils from './file-utils';
import { ProjectConfiguration } from '@nx/devkit';
import * as mocks from '../__mocks__/mocks';
import * as path from 'path';

describe('is-a-lib', () => {
  const setUp = () => {
    const projects: Record<
      'publishableLibrary' | 'nonPublishableLibrary' | 'app',
      ProjectConfiguration
    > = {
      publishableLibrary: mocks.getLib('pub-lib'),
      nonPublishableLibrary: mocks.getLib('non-pub-lib'),
      app: mocks.getApplication('app'),
    };

    return { projects };
  };

  describe('isProjectAPublishableLib', () => {
    const setUpIsProjectAPublishableLib = ({
      shouldPackageJsonExists,
    }: {
      shouldPackageJsonExists: boolean;
    }) => {
      const { projects } = setUp();

      const fileExistsMock = jest
        .spyOn(fileUtils, 'fileExists')
        .mockImplementation(() => Promise.resolve(shouldPackageJsonExists));

      return { fileExistsMock, projects };
    };

    afterEach(jest.restoreAllMocks);

    it('should indicate that the project is a publishable library', async () => {
      const { projects } = setUpIsProjectAPublishableLib({
        shouldPackageJsonExists: true,
      });

      const response = await isProjectAPublishableLib(
        projects.publishableLibrary
      );

      expect(response).toBe(true);
    });

    it('should indicate that the project is a non publishable library (app)', async () => {
      const { projects } = setUpIsProjectAPublishableLib({
        shouldPackageJsonExists: true,
      });

      const response = await isProjectAPublishableLib(projects.app);

      expect(response).toBe(false);
    });

    it('should indicate that the project is a non publishable library (non publishable library)', async () => {
      const { projects } = setUpIsProjectAPublishableLib({
        shouldPackageJsonExists: false,
      });

      const response = await isProjectAPublishableLib(
        projects.nonPublishableLibrary
      );

      expect(response).toBe(false);
    });

    it('should look for package.json file', async () => {
      const { fileExistsMock, projects } = setUpIsProjectAPublishableLib({
        shouldPackageJsonExists: false,
      });
      const project = projects.nonPublishableLibrary;

      await isProjectAPublishableLib(project);

      expect(fileExistsMock.mock.calls[0][0]).toEqual(
        path.join(project.root, 'package.json')
      );
    });
  });
});
