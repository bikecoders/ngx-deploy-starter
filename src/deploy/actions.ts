import { BuilderContext, Target, targetFromTargetString } from '@angular-devkit/architect';
import { logging } from '@angular-devkit/core';
import { BuildTarget } from 'interfaces';
import { resolve } from 'path';

import { Schema } from './schema';

export default async function deploy(
  engine: {
    run: (
      dir: string,
      options: Schema,
      logger: logging.LoggerApi
    ) => Promise<void>;
  },
  context: BuilderContext,
  buildTarget: BuildTarget,
  options: Schema
) {
  if (options.noBuild) {
    context.logger.info(`📦 Skipping build`);
  } else {
    if (!context.target) {
      throw new Error('Cannot execute the build target');
    }

    const configuration = options.configuration;

    context.logger.info(
      `📦 Building "${context.target.project}". ${
        configuration ? `Configuration "${configuration}"` : ''
      }`
    );

    const target = {
      target: 'build',
      project: context.target.project,
    } as Target;

    // Set the configuration if set on the options
    if (configuration) {
      target.configuration = configuration;
    }

    const build = await context.scheduleTarget(target);
    const result = await build.result;

    if (!result.success) {
      throw new Error('Failed to build target')
    }
  }

  const targetFromStr = targetFromTargetString(buildTarget.name);
  const buildOptions = await context.getTargetOptions(targetFromStr);

  if (!buildOptions.project || typeof buildOptions.project !== 'string') {
    throw new Error(`Cannot read "project" option of the build target`);
  }

  const outputPath = buildOptions.outputPath;

  if (!outputPath || typeof outputPath !== 'string') {
    throw new Error('Cannot read "outputPath" option of the build target');
  }

  await engine.run(resolve(context.workspaceRoot, outputPath), options, context.logger);
}
