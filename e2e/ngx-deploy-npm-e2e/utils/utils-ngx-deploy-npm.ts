import {
  ensureNxProject,
  runNxCommand,
  runPackageManagerInstall,
} from '@nx/plugin/testing';

export function initNgxDeployNPMProject() {
  // Init project
  beforeAll(() => {
    ensureNxProject('ngx-deploy-npm', 'dist/packages/ngx-deploy-npm');

    runPackageManagerInstall();
  }, 120000);
}

export function installNgxDeployNPMProject(options: string = '') {
  beforeEach(() => {
    runNxCommand(`generate ngx-deploy-npm:install ${options}`);
  }, 5000);
}
