import * as nxDevKit from '@nrwl/devkit';

import deploy from './actions';
import type { BuildTarget } from './utils';
import * as getLibOutputPathModule from './utils/get-lib-output-path';

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
    outputPath = `../../dist/randomness/${PROJECT}`;

    context = {
      root: 'random/system/path',
      projectName: PROJECT,
      target: {
        executor: 'ngx-deploy-npm',
      },
    } as nxDevKit.ExecutorContext;

    shouldBuilderSuccess = true;
  });

  // Spyes
  beforeEach(() => {
    jest.spyOn(nxDevKit, 'readTargetOptions').mockImplementation(() => ({}));

    jest
      .spyOn(getLibOutputPathModule, 'getLibOutPutPath')
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
    it('throws if app building fails', async () => {
      shouldBuilderSuccess = false;

      try {
        await deploy(mockEngine, context, getMockBuildTarget(), {});
        fail('should cause an error');
      } catch (e: unknown) {
        expect(e instanceof Error).toBeTruthy();
      }
    });
  });
});
