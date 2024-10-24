import * as fs from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

import { ProjectConfiguration } from '@nx/devkit';
import { readJson } from '@nx/plugin/testing';

import { currentNxVersion } from './get-nx-current-version';
import { InstallGeneratorOptions } from 'bikecoders/ngx-deploy-npm';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '.';

export const buildPackageProjectRoot = (libName: string) =>
  `packages/${libName}`;

const executeCommandFactory =
  (projectDirectory: string) => (command: string) => {
    let output: string;

    try {
      output = execSync(command, {
        stdio: 'inherit',
        cwd: projectDirectory,
        encoding: 'utf-8',
        env: process.env,
      });
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      if (error instanceof Error) {
        if ('stderr' in error && error.stderr) {
          console.error(`stderr: ${error.stderr}`);
        }
        if (error.message) {
          console.error(`message: ${error.message}`);
        }
      } else {
        console.error(`Unknown error: ${error}`);
      }
      throw error;
    }

    return output;
  };

export const setup = async (
  libs: {
    name: string;
    generator: 'minimal' | string;
    installOptions?: Omit<
      Partial<InstallGeneratorOptions>,
      'distFolderPath' | 'project'
    >;
    skipInstall?: boolean;
    extraOptions?: string;
    distFolderPath?: string;
  }[]
) => {
  const projectDirectory = await createTestProject();
  const executeCommand = executeCommandFactory(projectDirectory);

  initNgxDeployNPMProject(executeCommand);

  // Install dependencies only once
  const generators = new Set(
    libs
      .map(({ generator }) => generator)
      .filter(generator => generator !== 'minimal')
  );
  generators.forEach(dependency => {
    installDependencies(executeCommand, dependency);
  });

  // Init libs
  await Promise.all(
    libs.map(async ({ name, generator, extraOptions = '' }) => {
      if (generator === 'minimal') {
        await createMinimalLib(projectDirectory, name);
      } else {
        generateLib({
          nxPlugin: generator,
          executeCommand,
          libName: name,
          extraOptions: `--directory="${buildPackageProjectRoot(
            name
          )}" ${extraOptions}`,
        });
      }
    })
  );

  // Install ngx-deploy-npm
  libs
    .filter(({ skipInstall }) => !!skipInstall === false)
    .forEach(({ name, installOptions, generator }) => {
      installNgxDeployNPMProject(executeCommand, {
        project: name,
        distFolderPath:
          generator === 'minimal'
            ? buildPackageProjectRoot(name)
            : `dist/${buildPackageProjectRoot(name)}`,
        access: installOptions?.access || 'public',
        ...installOptions,
      });
    });

  const processedLibs: {
    name: string;
    workspace: ProjectConfiguration;
    npmPackageName: string;
  }[] = libs.map(({ name }) => ({
    name: name,
    workspace: readJson(
      `${projectDirectory}/${buildPackageProjectRoot(name)}/project.json`
    ),
    npmPackageName: readJson(
      `${projectDirectory}/${buildPackageProjectRoot(name)}/package.json`
    ).name,
  }));

  return {
    processedLibs,
    projectDirectory,
    tearDown: async () => {
      await fs.promises.rm(projectDirectory, {
        recursive: true,
        force: true,
      });

      return Promise.resolve();
    },
    executeCommand,
  };
};

async function createMinimalLib(projectDirectory: string, libName: string) {
  // Create Lib
  const libRootAbsolutePath = join(
    projectDirectory,
    buildPackageProjectRoot(libName)
  );
  const libRoot = buildPackageProjectRoot(libName);

  // Create the lib folder
  await fs.promises.mkdir(libRootAbsolutePath, {
    recursive: true,
  });

  const createProjectJsonPromise = fs.promises.writeFile(
    join(libRootAbsolutePath, 'project.json'),
    generateProjectJSON(libName, libRoot),
    'utf8'
  );
  const createPackageJsonPromise = fs.promises.writeFile(
    join(libRootAbsolutePath, 'package.json'),
    generatePackageJSON(libName),
    'utf8'
  );
  const createUniqueFilePromise = fs.promises.writeFile(
    join(libRootAbsolutePath, 'hello-world.js'),
    "console.log('Hello World!');",
    'utf8'
  );
  await Promise.all([
    createProjectJsonPromise,
    createPackageJsonPromise,
    createUniqueFilePromise,
  ]);

  return { libRoot };

  function generateProjectJSON(projectName: string, libRoot: string): string {
    const content = {
      name: projectName,
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      projectType: 'library',
      sourceRoot: libRoot,
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

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
async function createTestProject() {
  const projectName = 'test-project';
  const projectDirectory = join(process.cwd(), 'tmp', projectName);

  // Ensure projectDirectory is empty
  await fs.promises.rm(projectDirectory, {
    recursive: true,
    force: true,
  });
  await fs.promises.mkdir(dirname(projectDirectory), {
    recursive: true,
  });

  const command = `npx --yes create-nx-workspace@${currentNxVersion} ${projectName} --preset npm --nxCloud=skip --no-interactive`;
  executeCommandFactory(dirname(projectDirectory))(command);

  return projectDirectory;
}
