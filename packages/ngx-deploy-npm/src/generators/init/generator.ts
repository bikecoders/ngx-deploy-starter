import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import { convertNxGenerator } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { addDependencies, normalizeOptions } from './utils';
import type { InitGeneratorOptions } from './schema';

export async function initGenerator(
  tree: Tree,
  rawOptions: InitGeneratorOptions
): Promise<GeneratorCallback> {
  // Put again the eslint ignore
  const options = normalizeOptions(rawOptions);
  const installPackagesTask = addDependencies(tree);

  return runTasksInSerial(installPackagesTask);
}

export default initGenerator;

export const initSchematic = convertNxGenerator(initGenerator);
