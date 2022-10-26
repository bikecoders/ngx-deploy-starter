import { logger } from '@nrwl/devkit';
import path = require('path');

import { DeployExecutorOptions } from '../../../../schema';
import { readFileAsync } from '../../../file-utils';
import { IBuildOptions } from '../../shared';
import { IStrategy, UnapplicableStrategyError } from '../shared';

export const ngPackageStrategy: IStrategy = {
  name: 'ngPackage.json file',
  isStrategyApplicable: (buildOptions: IBuildOptions) =>
    buildOptions.project != undefined &&
    typeof buildOptions.project === 'string',
  executor: async (
    projectRoot: string,
    buildOptions: IBuildOptions,
    publishOptions: DeployExecutorOptions
  ) => {
    if (!ngPackageStrategy.isStrategyApplicable(buildOptions, publishOptions)) {
      throw new UnapplicableStrategyError(ngPackageStrategy.name);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ngPackagePath = path.join(projectRoot, buildOptions.project!);

    let ngPackageContentStr: string;
    try {
      ngPackageContentStr = await readFileAsync(ngPackagePath, {
        encoding: 'utf8',
      });
    } catch (error) {
      logger.error(error);
      throw new CanNotReadNGPackageError();
    }

    const ngPackageContent = JSON.parse(ngPackageContentStr);

    if (!ngPackageContent.dest || typeof ngPackageContent.dest !== 'string') {
      throw new CanNotReadDestOnNGPackageError();
    }

    const outputPath = path.join(
      path.dirname(ngPackagePath),
      ngPackageContent.dest
    );

    return outputPath;
  },
};

export class CanNotReadNGPackageError extends Error {
  constructor() {
    const errorMsg = 'Error reading the ng-package.json';
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CanNotReadDestOnNGPackageError extends Error {
  constructor() {
    const errorMsg =
      "'dest' option on ng-package.json doesn't exists or it's not a string";
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
