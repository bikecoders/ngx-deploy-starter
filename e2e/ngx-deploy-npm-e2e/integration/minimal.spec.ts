import {
  ensureNxProject,
  runNxCommand,
  runPackageManagerInstall,
  uniq,
} from '@nx/plugin/testing';
import * as fs from 'fs';

describe('Minimal Project', () => {
  const setup = async () => {
    ensureNxProject('ngx-deploy-npm', 'dist/packages/ngx-deploy-npm');
    runPackageManagerInstall();

    const uniqLibName = uniq('minimal-lib');

    const { libRoot } = await createMinimalLib(uniqLibName);

    // Install the project
    runNxCommand(
      `generate ngx-deploy-npm:install --project="${uniqLibName}" --dist-folder-path="${libRoot}"`
    );

    async function createMinimalLib(libName: string) {
      // Create Lib
      const libRoot = `libs/${libName}`;
      const libRootAbsolutePath = `./tmp/nx-e2e/proj/${libRoot}`;

      // Create the lib folder
      await fs.promises.mkdir(libRootAbsolutePath, {
        recursive: true,
      });

      const createProjectJsonPromise = fs.promises.writeFile(
        `${libRootAbsolutePath}/project.json`,
        generateProjectJSON(libName),
        'utf8'
      );
      const createPackageJsonPromise = fs.promises.writeFile(
        `${libRootAbsolutePath}/package.json`,
        generatePackageJSON(libName),
        'utf8'
      );
      const createUniqueFilePromise = fs.promises.writeFile(
        `${libRootAbsolutePath}/hello-world.js`,
        "console.log('Hello World!');",
        'utf8'
      );
      await Promise.all([
        createProjectJsonPromise,
        createPackageJsonPromise,
        createUniqueFilePromise,
      ]);

      return { libRoot };

      function generateProjectJSON(projectName: string): string {
        const content = {
          name: projectName,
          $schema: '../../node_modules/nx/schemas/project-schema.json',
          projectType: 'library',
        };

        return JSON.stringify(content, null, 2);
      }

      function generatePackageJSON(projectName: string): string {
        const content = {
          name: `@mock-domain/${projectName}`,
          description: 'Minimal LIb',
          version: '1.0.0',
        };

        return JSON.stringify(content, null, 2);
      }
    }

    return {
      libRoot,
      uniqLibName,
    };
  };

  it('should publish the lib', async () => {
    const { uniqLibName } = await setup();

    expect(() => {
      runNxCommand(`deploy ${uniqLibName} --dry-run`);
    }).not.toThrow();
  }, 120000);
});
