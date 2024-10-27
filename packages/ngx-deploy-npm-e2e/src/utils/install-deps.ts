import { getNxWorkspaceVersion } from './get-nx-workspace-version';

export function installDependencies(
  executeCommand: (command: string) => string,
  nxPlugin: string
) {
  const packageToInstall = `${nxPlugin}@${getNxWorkspaceVersion()}`;

  executeCommand(`npm add -D ${packageToInstall}`);
  executeCommand(`npx nx g ${nxPlugin}:init`);
}
