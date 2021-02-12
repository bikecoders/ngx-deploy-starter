import { JsonObject, logging } from '@angular-devkit/core';
import * as path from 'path';

import * as fs from '../utils/fs-async';
import { execAsync } from '../utils/exec-async';

import { Schema } from '../deploy/schema';
import { defaults, NpmPublishOptions } from './defaults';

export async function run(
  dir: string,
  options: Schema,
  logger: logging.LoggerApi
) {
  try {
    options = prepareOptions(options, logger);

    // If we are not on dry run
    if (options.packageVersion && !options.dryRun) {
      await setPackageVersion(dir, options.packageVersion);
    }

    const npmOptions = extractOnlyNPMOptions(options);
    const commandToPublish = `npm publish ${dir} ${getOptionsString(
      npmOptions
    )}`;

    const { stdout, stderr } = await execAsync(commandToPublish);

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

async function setPackageVersion(dir: string, packageVersion: string) {
  const packageContent: string = await fs.readFileAsync(
    path.join(dir, 'package.json'),
    { encoding: 'utf8' }
  );

  const packageObj: JsonObject = JSON.parse(packageContent);

  packageObj.version = packageVersion;

  await fs.writeFileAsync(
    path.join(dir, 'package.json'),
    JSON.stringify(packageObj, null, 4),
    { encoding: 'utf8' }
  );
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
  dryRun
}: Schema): NpmPublishOptions {
  return {
    access,
    tag,
    otp,
    dryRun
  };
}

function prepareOptions(
  origOptions: Schema,
  logger: logging.LoggerApi
): Schema {
  const options = {
    ...defaults,
    ...origOptions
  };

  if (options.dryRun) {
    logger.info('Dry-run: No changes are applied at all.');
  }

  return options;
}

function getOptionsString(options: NpmPublishOptions) {
  return (
    Object.keys(options)
      // Get only options with value
      .filter(optKey => !!options[optKey])
      // to CMD option
      .map(optKey => ({
        cmdOptions: `--${toKebabCase(optKey)}`,
        value: options[optKey]
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
