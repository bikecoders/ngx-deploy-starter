import packageJson from '../../../package.json'; // This import style requires "esModuleInterop", see "side notes"

export const currentNxVersion = packageJson.devDependencies['@nx/workspace'];
