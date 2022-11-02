import { PromiseWithChild } from 'child_process';

import { DeployExecutorOptions } from '../schema';
import { npmAccess } from '../../../core';
import * as engine from './engine';
import * as exec from '../utils/execute-async';
import * as setPackage from '../utils/set-package-version';

type execAsyncReturnType = PromiseWithChild<{
  stdout: string;
  stderr: string;
}>;

describe('engine', () => {
  let dir: string;
  let options: DeployExecutorOptions;

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Spies
  beforeEach(() => {
    jest.spyOn(exec, 'execAsync').mockImplementation(
      () =>
        Promise.resolve({
          stdout: 'package published',
          stderr: undefined,
        }) as unknown as execAsyncReturnType
    );
  });

  // Data
  beforeEach(() => {
    dir = 'customDir';
  });

  it('should call NPM Publish with the right options', async () => {
    options = {
      access: npmAccess.restricted,
      tag: 'next',
      otp: 'someValue',
      buildTarget: 'production',
      dryRun: true,
    };
    const optionsOnCMD = `--access ${options.access} --tag ${options.tag} --otp ${options.otp} --dry-run ${options.dryRun}`;

    await engine.run(dir, options);

    expect(exec.execAsync).toHaveBeenCalledWith(
      `npm publish "${dir}" ${optionsOnCMD}`
    );
  });

  it('should indicate that an error occurred when there is an error publishing the package', async () => {
    const customErr = 'custom err';
    jest.spyOn(exec, 'execAsync').mockImplementation(() => {
      throw new Error(customErr);
    });

    await expect(async () => {
      await engine.run(dir, options);
    }).rejects.toThrow();
  });

  describe('Options Management', () => {
    it('should set the default options', async () => {
      const options: DeployExecutorOptions = {};
      const optionsOnCMD = `--access public`;

      await engine.run(dir, options);

      expect(exec.execAsync).toHaveBeenCalledWith(
        `npm publish "${dir}" ${optionsOnCMD}`
      );
    });

    it('should overwrite the default option dry-run', async () => {
      const options: DeployExecutorOptions = {
        otp: 'random-text',
        dryRun: true,
        tag: 'random-tag',
      };
      const optionsOnCMD = `--access public --tag ${options.tag} --otp ${options.otp} --dry-run true`;

      await engine.run(dir, options);

      expect(exec.execAsync).toHaveBeenCalledWith(
        `npm publish "${dir}" ${optionsOnCMD}`
      );
    });

    it('should overwrite the default option access', async () => {
      const options = {
        tag: 'random-tag',
        access: npmAccess.restricted,
      };
      const optionsOnCMD = `--access ${npmAccess.restricted} --tag ${options.tag}`;

      await engine.run(dir, options);

      expect(exec.execAsync).toHaveBeenCalledWith(
        `npm publish "${dir}" ${optionsOnCMD}`
      );
    });
  });

  describe('Package.json Feature', () => {
    let version: string;
    let options: DeployExecutorOptions;

    // Spies
    beforeEach(() => {
      jest
        .spyOn(setPackage, 'setPackageVersion')
        .mockImplementation(() => Promise.resolve());
    });

    // Data
    beforeEach(() => {
      version = '1.0.1-next0';

      options = {
        packageVersion: version,
      };
    });

    it('should write the version of the sent on the package.json', async () => {
      await engine.run(dir, options);

      expect(setPackage.setPackageVersion).toHaveBeenCalledWith(dir, version);
    });

    it('should not write the version of the sent on the package.json if is on dry-run mode', async () => {
      options.dryRun = true;

      await engine.run(dir, options);

      expect(setPackage.setPackageVersion).not.toHaveBeenCalled();
    });
  });
});
