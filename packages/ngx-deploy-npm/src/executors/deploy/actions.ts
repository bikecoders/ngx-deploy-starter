import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
  Target,
} from '@nx/devkit';

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
  // This should be removed on V17. context.projectGraph is going to be required
  if (!context.projectGraph) {
    throw new Error('context.projectGraph is undefined');
  }

  const targetDescription = parseTargetString(
    buildTarget.name,
    context.projectGraph
  );

  if (options.noBuild) {
    logger.info(`📦 Skipping build`);
  } else {
    await buildLibrary(context, buildTarget, targetDescription);
  }

  const buildOptions = readTargetOptions(targetDescription, context);

  let outputPath: string;
  try {
    outputPath = await getLibOutPutPath(context.root, buildOptions, options);
  } catch (error) {
    logger.error(error);
    throw new NotAbleToGetDistFolderPathError();
  }

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
      throw new CouldNotBuildTheLibraryError();
    }
  }
}

export class CouldNotBuildTheLibraryError extends Error {
  constructor() {
    const errorMsg = 'Could not build the library';
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotAbleToGetDistFolderPathError extends Error {
  constructor() {
    const errorMsg =
      "There is an error trying to locate the library's dist path";
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
