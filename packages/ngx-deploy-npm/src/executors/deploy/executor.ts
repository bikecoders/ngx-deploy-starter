import { ExecutorContext, logger } from '@nx/devkit';

import deploy from './actions';
import * as engine from './engine/engine';
import { DeployExecutorOptions } from './schema';

export default async function runExecutor(
  options: DeployExecutorOptions,
  context: ExecutorContext
) {
  try {
    await deploy(engine, context, options);
  } catch (e) {
    logger.error(e);
    logger.error('Error when trying to publish the library');
    return { success: false };
  }

  return {
    success: true,
  };
}
