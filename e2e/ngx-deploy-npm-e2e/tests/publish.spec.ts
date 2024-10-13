import { runNxCommand, uniq } from '@nx/plugin/testing';
import { setup } from '../utils';

describe('Publish', () => {
  it('should publish an Angular Lib', async () => {
    const [angularLib] = await setup([
      {
        name: uniq('angular-lib'),
        generator: '@nx/angular',
        extraOptions: '--style css',
      },
    ]);

    expect(() => {
      runNxCommand(`deploy ${angularLib.name} --dry-run`);
    }).not.toThrow();
  }, 120000);

  it('should publish an Node Lib', async () => {
    const [angularLib] = await setup([
      {
        name: uniq('node-lib'),
        generator: '@nx/node',
      },
    ]);

    expect(() => {
      runNxCommand(`deploy ${angularLib.name} --dry-run`);
    }).not.toThrow();
  }, 120000);
});
