import * as path from 'path';

import * as fileUtils from '../../../../utils/file-utils';
import { IBuildOptions } from '../../shared';
import { UnapplicableStrategyError } from '../shared';
import {
  CanNotReadDestOnNGPackageError,
  CanNotReadNGPackageError,
  ngPackageStrategy,
} from './ng-package';

describe('ngPackageStrategy', () => {
  let projectRoot: string;
  let buildOptions: IBuildOptions;
  let destValue: string;

  beforeEach(() => {
    buildOptions = {
      project: 'libs/angular-lib/ng-package.json',
    };

    projectRoot = '/some/absolute/path/mock-project';

    destValue = '../../dist/my-project';
  });

  beforeEach(() => {
    jest
      .spyOn(fileUtils, 'readFileAsync')
      .mockImplementation(() =>
        Promise.resolve(`{ "dest": ${JSON.stringify(destValue)} }`)
      );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return the right dist path', async () => {
    const expectedPath = path.join(projectRoot, 'dist/my-project');

    const distPath = await ngPackageStrategy.executor(
      projectRoot,
      buildOptions,
      {}
    );

    expect(distPath).toEqual(expectedPath);
  });

  it('should try to read the the ng-package.json file on the right path', async () => {
    await ngPackageStrategy.executor(projectRoot, buildOptions, {});

    expect(fileUtils.readFileAsync).toBeCalledWith(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `${projectRoot}/${buildOptions.project!}`,
      expect.anything()
    );
  });

  it('should throw an error if there is not possible to read the ng-package.json file', async () => {
    jest
      .spyOn(fileUtils, 'readFileAsync')
      .mockImplementation(() => Promise.reject('file not found'));

    await expect(() =>
      ngPackageStrategy.executor(projectRoot, buildOptions, {})
    ).rejects.toThrowError(CanNotReadNGPackageError);
  });

  it('should throw an error if the `dest` option on `ngPackage.json` is invalid', async () => {
    destValue = 123 as unknown as string;

    await expect(() =>
      ngPackageStrategy.executor(projectRoot, buildOptions, {})
    ).rejects.toThrowError(CanNotReadDestOnNGPackageError);
  });

  it('should throw an error if trying the execute the strategy when it is not applicable', async () => {
    await expect(() =>
      ngPackageStrategy.executor(projectRoot, {}, {})
    ).rejects.toThrowError(UnapplicableStrategyError);
  });

  describe('isStrategyApplicable', () => {
    it('should indicate positively if the strategy is applicable', () => {
      const project = 'my/custom-folder';

      const isApplicable = ngPackageStrategy.isStrategyApplicable(
        {
          project,
        },
        {}
      );

      expect(isApplicable).toBe(true);
    });

    it('should indicate negatively if the strategy is not applicable', () => {
      const isApplicable = ngPackageStrategy.isStrategyApplicable(
        { outputPath: 'something/random' },
        {}
      );

      expect(isApplicable).toBe(false);
    });
  });
});
