import path = require('path');

import { DeployExecutorOptions } from '../../../../schema';
import { IBuildOptions } from '../../shared';
import { IStrategy, UnapplicableStrategyError } from '../shared';

export const outputPathOptionStrategy: IStrategy = {
  name: 'outputPath option',
  isStrategyApplicable: (buildOptions: IBuildOptions) =>
    buildOptions.outputPath != undefined &&
    typeof buildOptions.outputPath === 'string',
  executor: (
    projectRoot: string,
    buildOptions: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) => {
    if (
      !outputPathOptionStrategy.isStrategyApplicable(
        buildOptions,
        publishOptions
      )
    ) {
      throw new UnapplicableStrategyError(outputPathOptionStrategy.name);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return path.join(projectRoot, buildOptions.outputPath!);
  },
};
