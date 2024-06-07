const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2] || 'latest';

const tmpDir = path.join(__dirname, '..', 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });
process.chdir(tmpDir);

// Delete the previous workspace
if (fs.existsSync('nx-workspace')) {
  fs.rmSync('nx-workspace', { recursive: true, force: true });
}

console.log('Creating Nx Workspace with version:', version);
executeCommand(`npx --yes create-nx-workspace@${version} --version`);
console.log('☝️');

console.log('----- Create Nx Workspace -----');
executeCommand(
  `npx create-nx-workspace@${version} --name nx-workspace --preset npm ${
    version === '16.10.0' ? '--nxCloud=false' : '--nxCloud=skip'
  }`
);
process.chdir('nx-workspace');

fs.writeFileSync('.env', `NX_WORKSPACE_ROOT_PATH=${process.cwd()}`);

console.log('----- Generate lib -----');
executeCommand(`npm add -D @nx/node@${version}`);
executeCommand('npx nx generate @nx/node:init');
executeCommand(
  'npx nx generate @nx/node:library nx-lib --publishable --importPath nx-lib'
);

console.log('----- Link ngx-deploy-npm -----');
executeCommand('npx --yes yalc add ngx-deploy-npm');

console.log('----- Add ngx-deploy-npm to the workspace -----');
executeCommand(
  'npx nx generate ngx-deploy-npm:install --project nx-lib --distFolderPath dist/nx-lib'
);

console.log('----- Test the build -----');
executeCommand('npx nx deploy nx-lib --dry-run');

function executeCommand(command) {
  if (process.env.CI !== 'true') {
    console.log(`\x1b[32mExecuting command:\x1b[0m '${command}'`);
  }
  const commandArr = command.split(' ');

  spawnSync(
    commandArr[0],
    commandArr
      .slice(1)
      .map(arg => arg.split(' '))
      .flat(),
    {
      stdio: 'inherit',
    },
    {
      stdio: 'inherit',
    }
  );
}
