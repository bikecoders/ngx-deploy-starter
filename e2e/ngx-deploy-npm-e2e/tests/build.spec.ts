import { checkFilesExist, runNxCommand, uniq } from '@nx/plugin/testing';
import { setup } from '../utils';

describe('build', () => {
  const buildSetUp = (libName: string) =>
    setup([{ name: libName, generator: '@nx/node' }]);

  it('should build the lib due to the `dependsOn` option created on the target', async () => {
    const [lib] = await buildSetUp(uniq('basic-lib'));

    runNxCommand(`deploy ${lib.name} --dry-run`);

    expect(() =>
      checkFilesExist(`dist/libs/${lib.name}/package.json`)
    ).not.toThrow();
  }, 120000);
});
