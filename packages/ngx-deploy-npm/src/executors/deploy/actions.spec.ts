import * as nxDevKit from '@nx/devkit';

import deploy, {
  CouldNotBuildTheLibraryError,
  NotAbleToGetDistFolderPathError,
} from './actions';
import type { BuildTarget } from './utils';
import * as utilsModule from './utils';

describe('Deploy Angular apps', () => {
  let context: nxDevKit.ExecutorContext;
  let outputPath: string;
  let runExecutorSpy: jest.SpyInstance;

  // Set this to false if you want to cause an error when building
  let shouldBuilderSuccess: boolean;

  const PROJECT = 'RANDOM-PROJECT';
  const mockEngine = {
    run: jest.fn().mockImplementation(() => () => Promise.resolve()),
  } as unknown as Parameters<typeof deploy>[0];
  const getMockBuildTarget = (customConf = 'production'): BuildTarget => ({
    name: `${PROJECT}:build:${customConf}`,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    context = {
      root: '/absolute/mock/project-root',
      projectName: PROJECT,
      target: {
        executor: 'ngx-deploy-npm',
      },
      projectGraph: {},
    } as nxDevKit.ExecutorContext;

    outputPath = `${context.root}/dist/path/to/project/${PROJECT}`;

    shouldBuilderSuccess = true;
  });

  // Spyes
  beforeEach(() => {
    jest.spyOn(nxDevKit, 'readTargetOptions').mockImplementation(() => ({}));

    jest
      .spyOn(utilsModule, 'getLibOutPutPath')
      .mockImplementation(() => Promise.resolve(outputPath));

    runExecutorSpy = jest
      .spyOn(nxDevKit, 'runExecutor')
      .mockImplementation(() =>
        Promise.resolve({
          async *[Symbol.asyncIterator]() {
            yield {
              success: shouldBuilderSuccess,
            };
          },
        } as AsyncIterableIterator<{ success: boolean }>)
      );

    jest
      .spyOn(nxDevKit, 'parseTargetString')
      .mockImplementation(targetString => {
        const targetArr = targetString.split(':');

        return {
          project: targetArr[0],
          target: targetArr[1],
          configuration: targetArr[2],
        };
      });
  });

  it('should invoke the builder', async () => {
    await deploy(mockEngine, context, getMockBuildTarget(), {});

    expect(runExecutorSpy).toHaveBeenCalledWith(
      {
        configuration: 'production',
        target: 'build',
        project: PROJECT,
      },
      {},
      context
    );
  });

  it('should invoke the builder with the right configuration', async () => {
    const customConf = 'my-custom-conf';

    await deploy(mockEngine, context, getMockBuildTarget(customConf), {
      buildTarget: customConf,
    });

    expect(runExecutorSpy).toHaveBeenCalledWith(
      {
        target: 'build',
        project: PROJECT,
        configuration: customConf,
      },
      expect.anything(),
      expect.anything()
    );
  });

  describe('option --no-build', () => {
    it('should not invoke the builder if the option --no-build is passed', async () => {
      await deploy(mockEngine, context, getMockBuildTarget(), {
        noBuild: true,
      });

      expect(runExecutorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error if app building fails', async () => {
      shouldBuilderSuccess = false;

      await expect(() =>
        deploy(mockEngine, context, getMockBuildTarget(), {})
      ).rejects.toThrowError(CouldNotBuildTheLibraryError);
    });

    it('should throw if getLibOutPutPath fails', async () => {
      jest
        .spyOn(utilsModule, 'getLibOutPutPath')
        .mockImplementation(async () => {
          throw new Error('any error');
        });

      await expect(() =>
        deploy(mockEngine, context, getMockBuildTarget(), {})
      ).rejects.toThrowError(NotAbleToGetDistFolderPathError);
    });

    it('should throw if context.projectGraph is undefined', async () => {
      delete context.projectGraph;

      await expect(() =>
        deploy(mockEngine, context, getMockBuildTarget(), {})
      ).rejects.toThrowError('context.projectGraph is undefined');
    });
  });
});
