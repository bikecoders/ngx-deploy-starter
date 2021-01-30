import { BuilderContext } from '@angular-devkit/architect';
import * as fs from 'fs';

import { createFakeContext } from '../__mocks__/utils/context';
import deploy from './actions';

const mockEngine = {
  run: (_: string, __: any, __2: any) => Promise.resolve()
};

const PROJECT = 'pirojok-project';

const buildTarget = {
  name: `${PROJECT}:build:production`
};

const fakeReadFile = () =>
  JSON.stringify({
    projects: {
      [PROJECT]: {
        root: `packages/${PROJECT}`,
        architect: {
          build: {
            options: {
              outputPath: `dist/packages/${PROJECT}`
            }
          }
        }
      }
    }
  });

describe('Deploy Angular apps', () => {
  let context: BuilderContext;

  beforeEach(() => {
    context = createFakeContext({
      project: PROJECT,
      projectRoot: `/packages/${PROJECT}`,
      workspaceRoot: '/'
    });

    jest
      .spyOn(context, 'scheduleTarget')
      .mockResolvedValue({ result: Promise.resolve({ success: true }) } as any);

    jest.spyOn(context, 'getTargetOptions').mockResolvedValue({
      project: PROJECT,
      outputPath: `dist/packages/${PROJECT}`
    });

    jest
      .spyOn(fs, 'readFile')
      .mockImplementation((...args: Parameters<typeof fs.readFile>) => {
        const callback = args[args.length - 1] as Function;
        try {
          callback(null, fakeReadFile());
        } catch (e) {
          callback(e);
        }
      });
  });

  afterEach(() =>
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockRestore()
  );

  describe('Builder', () => {
    it('should invoke the builder', async () => {
      await deploy(mockEngine, context, buildTarget, {});

      expect(context.scheduleTarget).toHaveBeenCalledWith({
        target: 'build',
        project: PROJECT
      });
    });

    it('should invoke the builder with the right configuration', async () => {
      const customConf = 'my-custom-conf';

      await deploy(mockEngine, context, buildTarget, {
        configuration: customConf
      });

      expect(context.scheduleTarget).toHaveBeenCalledWith({
        target: 'build',
        project: PROJECT,
        configuration: customConf
      });
    });
  });

  it('should invoke engine.run', async () => {
    const runSpy = spyOn(mockEngine, 'run').and.callThrough();

    await deploy(mockEngine, context, buildTarget, {});

    expect(runSpy).toHaveBeenCalledWith(
      `/dist/packages/${PROJECT}`,
      {},
      context.logger
    );
  });

  describe('error handling', () => {
    it('should throw if there is no target project', async () => {
      context.target = undefined;

      try {
        await deploy(mockEngine, context, buildTarget, {});
        fail();
      } catch (e) {
        expect(e.message).toMatch(/Cannot execute the build target/);
      }
    });

    it('should throw if there is not "project" on build options', async () => {
      jest.spyOn(context, 'getTargetOptions').mockResolvedValue({});

      try {
        await deploy(mockEngine, context, buildTarget, {});
        fail();
      } catch (e) {
        expect(e.message).toBe(
          'Cannot read "project" option of the build target'
        );
      }
    });

    it('should throw if there is no "outputPath" on build options', async () => {
      jest.spyOn(context, 'getTargetOptions').mockResolvedValue({ project: PROJECT });

      try {
        await deploy(mockEngine, context, buildTarget, {});
        fail();
      } catch (e) {
        expect(e.message).toBe(
          'Cannot read "outputPath" option of the build target'
        );
      }
    });

    it('should throw if build output not succeeded', async () => {
       jest
         .spyOn(context, 'scheduleTarget')
         .mockResolvedValue({
           result: Promise.resolve({ success: false })
         } as any);

      try {
        await deploy(mockEngine, context, buildTarget, {});
        fail();
      } catch (e) {
        expect(e.message).toBe(
          'Failed to build target'
        );
      }
    });
  });
});
