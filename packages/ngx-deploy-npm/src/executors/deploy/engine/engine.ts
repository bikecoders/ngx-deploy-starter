import { logger } from '@nrwl/devkit';

import {
  execAsync,
  prepareOptions,
  setPackageVersion,
  NpmPublishOptions,
} from '../utils';
import { DeployExecutorOptions } from '../schema';

export async function run(dir: string, options: DeployExecutorOptions) {
  try {
    options = prepareOptions(options);

    if (options.dryRun) {
      logger.info('Dry-run: The package is not going to be published');
    }

    /*
    Modifying the dist when the user is dry-run mode,
    thanks to the Nx Cache could lead to leading to publishing and unexpected package version
    when the option is removed
    */
    if (options.packageVersion && !options.dryRun) {
      await setPackageVersion(dir, options.packageVersion);
    }

    const npmOptions = extractOnlyNPMOptions(options);
    const commandToPublish = `npm publish "${dir}" ${getOptionsString(
      npmOptions
    )}`;

    const maxBuffer = 100 * 1024 * 1024; // 100 times bigger than the default
    const { stdout, stderr } = await execAsync(commandToPublish, {
      maxBuffer, // Hot Fix for #401. A definitive solutions seems to replace exec in favor of spawn
    });

    logger.info(stdout);
    logger.info(stderr);

    if (options.dryRun) {
      logger.info('The options are:');
      logger.info(JSON.stringify(options, null, 1));
    }

    logger.info(
      '🚀 Successfully published via ngx-deploy-npm! Have a nice day!'
    );
  } catch (error) {
    logger.error('❌ An error occurred!');
    throw error;
  }
}

/**
 * Extract only the options that the `npm publish` command can process
 *
 * @param param0 All the options sent to ng deploy
 */
function extractOnlyNPMOptions({
  access,
  tag,
  otp,
  dryRun,
}: DeployExecutorOptions): NpmPublishOptions {
  return {
    access,
    tag,
    otp,
    dryRun,
  };
}

function getOptionsString(options: NpmPublishOptions) {
  return (
    Object.keys(options)
      // Get only options with value
      .filter(optKey => !!(options as Record<string, string>)[optKey])
      // to CMD option
      .map(optKey => ({
        cmdOptions: `--${toKebabCase(optKey)}`,
        value: (options as Record<string, string>)[optKey],
      }))
      // to string
      .map(
        cmdOptionValue => `${cmdOptionValue.cmdOptions} ${cmdOptionValue.value}`
      )
      .join(' ')
  );

  function toKebabCase(str: string) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
