import * as path from 'path';

import { DeployExecutorOptions } from '../../../../schema';
import { IBuildOptions } from '../../shared';
import { IStrategy, UnapplicableStrategyError } from '../shared';

/**
 * Use this strategy when we don't have a strategy to locate the dist folder for that library.
 *
 * Apply it using the option --dist-folder-path
 *
 * @example
 * ```bash
 * nx deploy YOUR_LIB --dist-folder-path ./YOUR/CUSTOM/PATH
 * ```
 */
export const customDistPathStrategy: IStrategy = {
  name: 'custom dist path',
  isStrategyApplicable: (
    _: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) =>
    publishOptions.distFolderPath != undefined &&
    typeof publishOptions.distFolderPath === 'string',
  executor: (
    projectRoot: string,
    buildOptions: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) => {
    if (
      !customDistPathStrategy.isStrategyApplicable(buildOptions, publishOptions)
    ) {
      throw new UnapplicableStrategyError(customDistPathStrategy.name);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return path.join(projectRoot, publishOptions.distFolderPath!);
  },
};
