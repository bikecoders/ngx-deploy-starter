import { runNxCommand, uniq } from '@nx/plugin/testing';

import { installNgxDeployNPMProject } from './utils-ngx-deploy-npm';
import { installDependencies } from './install-deps';
import { generateLib } from './generate-lib';

type Options = {
  /**
   * The generator of the plugin to
   */
  generator?: string;
  /**
   * Extra options on the command lib generator
   */
  libGeneratorCommandOptions?: string;
  /**
   * Set the option --publishable when generating the library
   */
  setPublishableOption?: boolean;
};

export function basicSetTestForLibs(
  libName: string,
  nxPlugin: string,
  options?: Options
) {
  installDependencies(nxPlugin);

  const uniqLibName = uniq(libName);

  generateLib(
    nxPlugin,
    uniqLibName,
    options?.libGeneratorCommandOptions,
    options?.generator,
    options?.setPublishableOption
  );

  // Install the project
  installNgxDeployNPMProject(
    `--project="${uniqLibName}" --distFolderPath="dist/libs/${uniqLibName}"`
  );

  it('should publish the lib', () => {
    expect(() => {
      runNxCommand(`deploy ${uniqLibName} --dry-run`);
    }).not.toThrow();
  }, 120000);
}
