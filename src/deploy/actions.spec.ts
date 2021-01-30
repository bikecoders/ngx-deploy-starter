import { BuilderContext } from '@angular-devkit/architect/src';
import * as fs from 'fs';
import * as path from 'path';

import deploy from './actions';

const mockEngine = {
  run: (_: string, __: any, __2: any) => Promise.resolve()
};

const PROJECT = 'pirojok-project';

const buildTarget = {
  name: `${PROJECT}:build:production`
};

function createFakeContext({
  project,
  projectRoot,
  workspaceRoot
}: {
  project: string;
  projectRoot: string;
  workspaceRoot: string;
}): BuilderContext {
  return {
    scheduleTarget: jest.fn(),
    getTargetOptions: jest.fn(),
    getProjectMetadata: jest.fn().mockReturnValue({ root: projectRoot }),
    logger: { error: jest.fn(), info: jest.fn() },
    reportStatus: jest.fn(),
    target: {
      project
    },
    workspaceRoot
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } as any;
}

describe('Deploy Angular apps', () => {
  let fakeReadFile: jest.Mock;

  let context = createFakeContext({
    project: PROJECT,
    projectRoot: `/packages/${PROJECT}`,
    workspaceRoot: '/'
  });

  beforeEach(() => {
    fakeReadFile = jest.fn().mockReturnValue(
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
      })
    );

    jest
      .spyOn(fs, 'readFile')
      .mockImplementation((...args: Parameters<typeof fs.readFile>) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const callback = args[args.length - 1] as Function;
        try {
          callback(null, fakeReadFile(args));
        } catch (e) {
          callback(e);
        }
      });
  });

  afterEach(() =>
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockRestore()
  );

  describe('Builder', () => {
    beforeEach(() => {
      jest
        .spyOn(context, 'scheduleTarget')
        .mockResolvedValue({ result: Promise.resolve() } as any);

        jest
        .spyOn(context, 'getTargetOptions')
        .mockResolvedValue({
          project: PROJECT,
          outputPath: `dist/packages/${PROJECT}`
        });
    });

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

    it('should throw if there is not project on build options', async () => {
      context.getTargetOptions = () => Promise.resolve({});

      try {
        await deploy(mockEngine, context, buildTarget, {});
        fail();
      } catch (e) {
        expect(e.message).toMatch(
          /Cannot read the project path option of the Angular library '.*' in angular.json/
        );
      }
    });
  });
});
