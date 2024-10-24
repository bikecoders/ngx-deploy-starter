import { currentNxVersion } from './get-nx-current-version';

export function installDependencies(
  executeCommand: (command: string) => string,
  nxPlugin: string
) {
  const packageToInstall = `${nxPlugin}@${currentNxVersion}`;

  executeCommand(`npm add -D ${packageToInstall}`);
  executeCommand(`npx nx g ${nxPlugin}:init`);
}
