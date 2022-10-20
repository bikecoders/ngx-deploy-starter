import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
  Target,
} from '@nrwl/devkit';

import { DeployExecutorOptions } from './schema';
import { BuildTarget, getLibOutPutPath } from './utils';

export default async function deploy(
  engine: {
    run: (dir: string, options: DeployExecutorOptions) => Promise<void>;
  },
  context: ExecutorContext,
  buildTarget: BuildTarget,
  options: DeployExecutorOptions
) {
  const targetDescription = parseTargetString(buildTarget.name);

  if (options.noBuild) {
    logger.info(`📦 Skipping build`);
  } else {
    await buildLibrary(context, buildTarget, targetDescription);
  }

  const buildOptions = readTargetOptions(targetDescription, context);

  const outputPath = await getLibOutPutPath(
    context.root,
    buildOptions,
    options,
    targetDescription.project
  );

  await engine.run(outputPath, options);
}

async function buildLibrary(
  context: ExecutorContext,
  buildTarget: BuildTarget,
  targetDescription: Target
) {
  if (!context.target) {
    throw new Error('Cannot execute the build target');
  }

  logger.info(`📦 Building "${context.projectName}"`);
  logger.info(`📦 Build target "${buildTarget.name}"`);

  const buildResult = await runExecutor(targetDescription, {}, context);

  for await (const output of buildResult) {
    if (!output.success) {
      throw new Error('Could not build the library');
    }
  }
}
