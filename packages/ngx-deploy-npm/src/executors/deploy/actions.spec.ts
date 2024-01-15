import * as nxDevKit from '@nx/devkit';
import * as path from 'path';

import deploy from './actions';
import { mockProjectRoot } from '../../__mocks__/mocks';
import { DeployExecutorOptions } from './schema';

describe('Deploy', () => {
  const setup = () => {
    const PROJECT = 'RANDOM-PROJECT';
    const mockEngine = {
      run: jest.fn().mockImplementation(() => () => Promise.resolve()),
    } as unknown as Parameters<typeof deploy>[0];

    const context: nxDevKit.ExecutorContext = {
      root: mockProjectRoot,
      projectName: PROJECT,
      target: {
        executor: 'ngx-deploy-npm:deploy',
      },
      projectGraph: {},
    } as nxDevKit.ExecutorContext;

    return {
      PROJECT,
      context,
      mockEngine,
    };
  };

  it('should invoke the engine', async () => {
    const { mockEngine, context } = setup();
    const options: DeployExecutorOptions = {
      distFolderPath: 'dist/libs/project',
      access: 'public',
    };

    await deploy(mockEngine, context, options);

    expect(mockEngine.run).toHaveBeenCalledWith(
      path.join(context.root, options.distFolderPath),
      options
    );
  });
});
