import { ExecutorContext, logger } from '@nx/devkit';

import deploy from './actions';
import * as engine from './engine/engine';
import { DeployExecutorOptions } from './schema';

export default async function runExecutor(
  options: DeployExecutorOptions,
  context: ExecutorContext
) {
  const configuration = options.buildTarget ? `:${options.buildTarget}` : '';
  const buildTarget = {
    name: `${context.projectName}:build${configuration}`,
  };

  try {
    await deploy(engine, context, buildTarget, options);
  } catch (e) {
    logger.error(e);
    logger.error('Error when trying to publish the library');
    return { success: false };
  }

  return {
    success: true,
  };
}
