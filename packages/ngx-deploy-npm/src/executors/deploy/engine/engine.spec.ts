import { DeployExecutorOptions } from '../schema';
import { npmAccess } from '../../../core';
import * as engine from './engine';
import * as spawn from '../utils/spawn-async';
import * as setPackage from '../utils/set-package-version';
import { mockProjectDist, mockProjectRoot } from '../../../__mocks__/mocks';

describe('engine', () => {
  const defaultOption: Readonly<Omit<DeployExecutorOptions, 'distFolderPath'>> =
    Object.freeze({
      access: npmAccess.public,
    });
  const setup = ({
    options = defaultOption,
    rootProject = mockProjectRoot,
    distFolderPath = mockProjectDist(),
    spawnAsyncReturnValue = () => Promise.resolve(),
  }: {
    rootProject?: string;
    distFolderPath?: string;
    spawnAsyncReturnValue?: () => Promise<void>;
    options?: Omit<DeployExecutorOptions, 'distFolderPath'>;
  }) => {
    const fullOptions: DeployExecutorOptions = {
      ...options,
      distFolderPath,
    };
    jest.spyOn(spawn, 'spawnAsync').mockImplementation(spawnAsyncReturnValue);

    return {
      absoluteDistFolderPath: `${rootProject}/${distFolderPath}`,
      options: fullOptions,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call NPM Publish with the right options', async () => {
    const expectedOptionsArray = [
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
    const { absoluteDistFolderPath, options } = setup({
      options: {
        access: npmAccess.restricted,
        tag: 'next',
        otp: 'someValue',
        registry: 'http://localhost:4873',
        dryRun: true,
      },
    });

    await engine.run(absoluteDistFolderPath, options);

    expect(spawn.spawnAsync).toHaveBeenCalledWith('npm', [
      'publish',
      absoluteDistFolderPath,
      ...expectedOptionsArray,
    ]);
  });

  it('should indicate that an error occurred when there is an error publishing the package', async () => {
    const { absoluteDistFolderPath, options } = setup({
      spawnAsyncReturnValue: () => Promise.reject(new Error('custom error')),
    });

    await expect(() =>
      engine.run(absoluteDistFolderPath, options)
    ).rejects.toThrow();
  });

  describe('Package.json Feature', () => {
    const pJsonSetup = ({
      version = '1.0.1-next0',
      setPackageReturnValue = Promise.resolve(),
      ...originalSetupOptions
    }: {
      version?: string;
      setPackageReturnValue?: Promise<void>;
    } & Parameters<typeof setup>[0]) => {
      jest
        .spyOn(setPackage, 'setPackageVersion')
        .mockImplementation(() => setPackageReturnValue);

      if (!originalSetupOptions.options) {
        originalSetupOptions.options = { ...defaultOption };
      }

      originalSetupOptions.options.packageVersion = version;

      return {
        version,
        ...setup(originalSetupOptions),
      };
    };

    it('should write the version of the sent on the package.json', async () => {
      const { absoluteDistFolderPath, version, options } = pJsonSetup({});

      await engine.run(absoluteDistFolderPath, options);

      expect(setPackage.setPackageVersion).toHaveBeenCalledWith(
        absoluteDistFolderPath,
        version
      );
    });

    it('should not write the version of the sent on the package.json if is on dry-run mode', async () => {
      const { absoluteDistFolderPath, options } = pJsonSetup({
        options: {
          access: npmAccess.public,
          dryRun: true,
        },
      });

      await engine.run(absoluteDistFolderPath, options);

      expect(setPackage.setPackageVersion).not.toHaveBeenCalled();
    });
  });
});
