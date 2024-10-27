import { uniq } from '@nx/plugin/testing';
import { setup } from './utils';

describe('Publish', () => {
  test.each([
    {
      name: uniq('angular-lib'),
      generator: '@nx/angular',
      extraOptions: '--style css',
    },
    {
      name: uniq('node-lib'),
      generator: '@nx/node',
    },
  ])(
    'should publish with $generator lib',
    async libConfig => {
      const { executeCommand, tearDown, processedLibs } = await setup([
        libConfig,
      ]);
      const [lib] = processedLibs;

      executeCommand(
        `npx nx deploy ${lib.name} --registry=http://localhost:4873 --tag="e2e" --packageVersion=0.0.0`
      );

      expect(() => {
        executeCommand(`npm view ${lib.npmPackageName}@0.0.0`);
        executeCommand(`npm view ${lib.npmPackageName}@e2e`);
      }).not.toThrow();

      return tearDown();
    },
    120000 * 2
  );
});
