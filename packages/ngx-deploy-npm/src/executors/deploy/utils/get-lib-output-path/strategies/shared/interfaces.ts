import { DeployExecutorOptions } from '../../../../schema';
import { IBuildOptions } from '../../shared';

export type IStrategy = {
  name: string;
  isStrategyApplicable: (
    buildOptions: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) => boolean;
  executor: (
    projectRoot: string,
    buildOptions: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) => string | Promise<string>;
};
