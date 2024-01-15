import { DeployExecutorOptions } from '../schema';
import { npmAccess } from '../../../core';
import * as engine from './engine';
import * as spawn from '../utils/spawn-async';
import * as setPackage from '../utils/set-package-version';
import { mockProjectDist, mockProjectRoot } from '../../../__mocks__/mocks';

// TODO Migrate to SIFERS approach
describe('engine', () => {
  let dir: string;
  let distFolderPath: string;
  let options: DeployExecutorOptions;

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Spies
  beforeEach(() => {
    jest.spyOn(spawn, 'spawnAsync').mockImplementation(() => Promise.resolve());
  });

  // Data
  beforeEach(() => {
    dir = mockProjectRoot;
    distFolderPath = mockProjectDist();
  });

  it('should call NPM Publish with the right options', async () => {
    options = {
      distFolderPath,
      access: npmAccess.restricted,
      tag: 'next',
      otp: 'someValue',
      registry: 'http://localhost:4873',
      dryRun: true,
    };
    const optionsArray = [
      '--access',
      npmAccess.restricted,
      '--tag',
      'next',
      '--otp',
      'someValue',
      '--dry-run',
      'true',
      '--registry',
      'http://localhost:4873',
    ];

    await engine.run(dir, options);

    expect(spawn.spawnAsync).toHaveBeenCalledWith('npm', [
      'publish',
      dir,
      ...optionsArray,
    ]);
  });

  it('should indicate that an error occurred when there is an error publishing the package', async () => {
    const customErr = 'custom err';
    jest
      .spyOn(spawn, 'spawnAsync')
      .mockImplementation(() => Promise.reject(new Error(customErr)));

    await expect(() => engine.run(dir, options)).rejects.toThrow();
  });

  describe('Options Management', () => {
    it('should set the default options', async () => {
      const options: DeployExecutorOptions = {
        distFolderPath,
        access: npmAccess.public,
      };
      const optionsArray = ['--access', npmAccess.public];

      await engine.run(dir, options);

      expect(spawn.spawnAsync).toHaveBeenCalledWith('npm', [
        'publish',
        dir,
        ...optionsArray,
      ]);
    });

    it('should overwrite the default option access', async () => {
      const options = {
        distFolderPath: 'dist/libs/project',
        tag: 'random-tag',
        access: npmAccess.restricted,
      };
      const optionsArray = [
        '--access',
        npmAccess.restricted,
        '--tag',
        'random-tag',
      ];

      await engine.run(dir, options);

      expect(spawn.spawnAsync).toHaveBeenCalledWith('npm', [
        'publish',
        dir,
        ...optionsArray,
      ]);
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
        distFolderPath,
        packageVersion: version,
        access: 'public',
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
