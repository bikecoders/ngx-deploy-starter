import { TargetConfiguration } from '@nx/devkit';
import { uniq } from '@nx/plugin/testing';

import { DeployExecutorOptions } from '../../../packages/ngx-deploy-npm/src/executors/deploy/schema';
import { npmAccess } from '../../../packages/ngx-deploy-npm/src/core';
import { setup } from '../utils';

describe('install', () => {
  const expectedTarget = ({
    projectName,
    isBuildable = true,
    access = npmAccess.public,
    customDistFolderPath,
  }: {
    projectName: string;
    isBuildable?: boolean;
    access?: npmAccess;
    customDistFolderPath?: string;
  }): TargetConfiguration<DeployExecutorOptions> => {
    const target: TargetConfiguration<DeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        distFolderPath: customDistFolderPath || `dist/libs/${projectName}`,
        access,
      },
    };

    if (isBuildable) {
      target.dependsOn = ['build'];
    }

    return target;
  };

  it('should modify the workspace only for the indicated libs', async () => {
    const [publicLib, publicLib2, restrictedLib, libNOTSet, smallLib] =
      await setup([
        { name: uniq('node-lib1'), generator: '@nx/node' },
        { name: uniq('node-lib2'), generator: '@nx/node' },
        {
          name: uniq('node-resctricted'),
          access: npmAccess.restricted,
          generator: '@nx/node',
        },
        {
          name: uniq('node-lib-not-set'),
          skipInstall: true,
          generator: '@nx/node',
        },
        { name: uniq('small-lib'), generator: 'minimal' },
      ]);

    expect(publicLib.workspace.targets?.deploy).toEqual(
      expectedTarget({ projectName: publicLib.name })
    );
    expect(publicLib2.workspace.targets?.deploy).toEqual(
      expectedTarget({ projectName: publicLib2.name })
    );
    expect(restrictedLib.workspace.targets?.deploy).toEqual(
      expectedTarget({
        projectName: restrictedLib.name,
        access: npmAccess.restricted,
      })
    );
    expect(libNOTSet.workspace.targets?.deploy).toEqual(undefined);

    expect(smallLib.workspace.targets?.deploy).toEqual(
      expectedTarget({
        projectName: smallLib.name,
        customDistFolderPath: smallLib.workspace.sourceRoot,
        isBuildable: false,
      })
    );
  }, 120000);
});
