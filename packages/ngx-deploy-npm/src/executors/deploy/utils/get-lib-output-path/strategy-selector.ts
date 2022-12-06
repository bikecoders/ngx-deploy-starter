import { DeployExecutorOptions } from '../../schema';
import { IBuildOptions } from './shared';
import * as strategies from './strategies';
import { IStrategy } from './strategies/shared';

export async function getLibOutPutPath(
  projectRoot: string,
  buildOptions: IBuildOptions,
  publishOptions: DeployExecutorOptions
): Promise<string> {
  const strategyChosen = chooseStrategy(buildOptions, publishOptions);

  return strategyChosen(projectRoot, buildOptions, publishOptions);
}

function chooseStrategy(
  buildOptions: IBuildOptions,
  publishOptions: DeployExecutorOptions
): IStrategy['executor'] {
  if (
    strategies.customDistPathStrategy.isStrategyApplicable(
      buildOptions,
      publishOptions
    )
  ) {
    return strategies.customDistPathStrategy.executor;
  }

  if (
    strategies.outputPathOptionStrategy.isStrategyApplicable(
      buildOptions,
      publishOptions
    )
  ) {
    return strategies.outputPathOptionStrategy.executor;
  }

  if (
    strategies.ngPackageStrategy.isStrategyApplicable(
      buildOptions,
      publishOptions
    )
  ) {
    return strategies.ngPackageStrategy.executor;
  }

  throw new NotAbleToDetermineDistPathError();
}

export class NotAbleToDetermineDistPathError extends Error {
  constructor() {
    const errorMsg = `ngx-deploy-npm was not able to detect the dist path.\n
Use the option --dist-folder-path to indicate where is the dist folder of your library\n
Write us an issue to add support to your library -> https://github.com/bikecoders/ngx-deploy-npm/issues/new`;
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
