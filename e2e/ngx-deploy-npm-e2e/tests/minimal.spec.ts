import { runNxCommand, uniq } from '@nx/plugin/testing';
import { setup } from '../utils';

describe('Minimal Project', () => {
  it('should publish the lib', async () => {
    const [uniqLibName] = await setup([
      { name: uniq('minimal-lib'), generator: 'minimal' },
    ]);

    expect(() => {
      runNxCommand(`deploy ${uniqLibName.name} --dry-run`);
    }).not.toThrow();
  }, 120000);
});
