import { JsonObject, logging } from '@angular-devkit/core';
import {
  BuilderContext,
  BuilderRun,
  ScheduleOptions,
  Target
} from '@angular-devkit/architect/src/index';

import deploy from './actions';
import { BuildTarget } from 'interfaces';
import * as path from 'path';

import { readFileAsync } from '../utils';
jest.mock('../utils');

const mockEngine = {
  run: (_: string, __: any, __2: any) => Promise.resolve()
};
const PROJECT = 'pirojok-project';

let context: BuilderContext;
let targetOptions: JsonObject;
let mockedReadFileAsync: jest.Mock<ReturnType<typeof readFileAsync>>;
let ngPackageContent: JsonObject;

describe('Deploy Angular apps', () => {
  afterEach(() => {
    targetOptions = {};
  });

  beforeEach(() => {
    ngPackageContent = {
      dest: `../../dist/randomness/${PROJECT}`
    };

    mockedReadFileAsync = readFileAsync as jest.Mock<
      ReturnType<typeof readFileAsync>
    >;
    mockedReadFileAsync.mockImplementation(() =>
      Promise.resolve(JSON.stringify(ngPackageContent, null, 2))
    );

    initMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Builder', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(context, 'scheduleTarget');
    });

    it('should invoke the builder', async () => {
      await deploy(mockEngine, context, getBuildTarget(), {});

      expect(spy).toHaveBeenCalledWith({
        target: 'build',
        project: PROJECT
      });
    });

    it('should invoke the builder with the right configuration', async () => {
      const customConf = 'my-custom-conf';

      await deploy(mockEngine, context, getBuildTarget(), {
        configuration: customConf
      });

      expect(spy).toHaveBeenCalledWith({
        target: 'build',
        project: PROJECT,
        configuration: customConf
      });
    });
  });

  describe('Getting Output Path', () => {
    describe('With Output Path', () => {
      beforeEach(() => {
        targetOptions = {
          outputPath: 'some/dist/path'
        };
      });

      it('should invoke engine.run with the right params', async () => {
        const expectedOutputDir = path.join(
          context.workspaceRoot,
          targetOptions.outputPath as string
        );
        const runSpy = spyOn(mockEngine, 'run').and.callThrough();

        await deploy(mockEngine, context, getBuildTarget(), {});

        expect(runSpy).toHaveBeenCalledWith(
          expectedOutputDir,
          {},
          context.logger
        );
      });
    });

    describe('Without Output Path', () => {
      it('should invoke engine.run with the right params', async () => {
        const expectedOutputDir = path.join(
          context.workspaceRoot,
          `dist/randomness/${PROJECT}`
        );
        const runSpy = spyOn(mockEngine, 'run').and.callThrough();

        await deploy(mockEngine, context, getBuildTarget(), {});

        expect(runSpy).toHaveBeenCalledWith(
          expectedOutputDir,
          {},
          context.logger
        );
      });
    });
  });

  describe('error handling', () => {
    it('should throw if there is no target project', async () => {
      context.target = undefined;
      try {
        await deploy(mockEngine, context, getBuildTarget(), {});
        fail();
      } catch (e) {
        expect(e.message).toMatch(/Cannot execute the build target/);
      }
    });

    it('should throw if there is not project on build options', async () => {
      context.getTargetOptions = () => Promise.resolve({});

      try {
        await deploy(mockEngine, context, getBuildTarget(), {});
        fail();
      } catch (e) {
        expect(e.message).toMatch(
          /Cannot read the project path option of the library '.*' in the workspace/
        );
      }
    });
  });
});

const initMocks = () => {
  context = ({
    target: {
      configuration: 'production',
      project: PROJECT,
      target: 'foo'
    },
    builder: {
      builderName: 'mock',
      description: 'mock',
      optionSchema: false
    },
    workspaceRoot: 'my/workspace/root',
    logger: new logging.NullLogger() as any,
    scheduleTarget: (_: Target, __?: JsonObject, ___?: ScheduleOptions) =>
      Promise.resolve({} as BuilderRun),
    getTargetOptions: (t: Target) =>
      Promise.resolve({
        project: `projects/${t.project}/some-file.json`,
        target: t.target,
        ...targetOptions
      })
  } as unknown) as BuilderContext;
};

const getBuildTarget = (): BuildTarget => ({
  name: `${PROJECT}:build:production`
});
