import * as path from 'path';

import { DeployExecutorOptions } from '../../../../schema';
import { IBuildOptions } from '../../shared';
import { IStrategy, UnapplicableStrategyError } from '../shared';

/**
 * This strategy is the common one across Nx Official Plugins.
 * We get the dist path from the option `outputPath` from the `build` target's options.
 *
 * @example ```json
 * // project.json
 * {
 *   "build": {
 *     "executor": "@nx/js:tsc",
 *     "outputs": ["{options.outputPath}"],
 *     "options": {
 *       "outputPath": "dist/packages/ngx-deploy-npm", // <------- outputPath Option
 *       "tsConfig": "packages/ngx-deploy-npm/tsconfig.lib.json",
 *       "packageJson": "packages/ngx-deploy-npm/package.json",
 *       "main": "packages/ngx-deploy-npm/src/index.ts",
 *     }
 *   }
 * }
 *```
 */
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
