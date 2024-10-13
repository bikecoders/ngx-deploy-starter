import {
  ensureNxProject,
  runNxCommand,
  runPackageManagerInstall,
} from '@nx/plugin/testing';

export function initNgxDeployNPMProject() {
  // Init project
  ensureNxProject('ngx-deploy-npm', 'dist/packages/ngx-deploy-npm');
  runPackageManagerInstall();
}

export function installNgxDeployNPMProject(options: string = '') {
  runNxCommand(`generate ngx-deploy-npm:install ${options}`);
}
