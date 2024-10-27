import { readJson } from '@nx/plugin/testing';

export const getNxWorkspaceVersion = () => {
  const nxVersion = process.env.NGX_DEPLOY_NPM_E2E__NX_VERSION;

  if (nxVersion) {
    return nxVersion;
  } else {
    return readJson(`${process.cwd()}/package.json`).devDependencies[
      '@nx/workspace'
    ];
  }
};
