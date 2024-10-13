import * as fs from 'fs';
import { ProjectConfiguration } from '@nx/devkit';
import { readJson } from '@nx/plugin/testing';

import { npmAccess } from '../../../packages/ngx-deploy-npm/src/core';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '.';

export const setup = async (
  libs: {
    name: string;
    generator: 'minimal' | string;
    access?: npmAccess;
    skipInstall?: boolean;
    extraOptions?: string;
    distFolderPath?: string;
  }[]
) => {
  initNgxDeployNPMProject();

  // Install dependencies only once
  const generators = new Set(
    libs
      .map(({ generator }) => generator)
      .filter(generator => generator !== 'minimal')
  );
  generators.forEach(dependency => {
    installDependencies(dependency);
  });

  // Init libs
  await Promise.all(
    libs.map(async ({ name, generator, extraOptions = '' }) => {
      if (generator === 'minimal') {
        await createMinimalLib(name);
      } else {
        generateLib({
          nxPlugin: generator,
          libName: name,
          extraOptions: `--directory="libs/${name}" ${extraOptions}`,
        });
      }
    })
  );

  // Install ngx-deploy-npm
  libs
    .filter(({ skipInstall }) => !!skipInstall === false)
    .forEach(({ name, access, generator }) => {
      const accessOption = !!access ? `--access ${access}` : '';

      const distFolderPath =
        generator === 'minimal'
          ? getMinimalLibRoot(name).libRoot
          : `dist/libs/${name}`;

      installNgxDeployNPMProject(
        `--project="${name}" --dist-folder-path="${distFolderPath}" ${accessOption}`
      );
    });

  const processedLibs: { name: string; workspace: ProjectConfiguration }[] =
    libs.map(({ name }) => ({
      name: name,
      workspace: readJson(`libs/${name}/project.json`),
    }));

  return processedLibs;
};

function getMinimalLibRoot(libName: string) {
  const libRoot = `libs/${libName}`;
  const libRootAbsolutePath = `./tmp/nx-e2e/proj/${libRoot}`;

  return { libRoot, libRootAbsolutePath };
}

async function createMinimalLib(libName: string) {
  // Create Lib
  const { libRoot, libRootAbsolutePath } = getMinimalLibRoot(libName);

  // Create the lib folder
  await fs.promises.mkdir(libRootAbsolutePath, {
    recursive: true,
  });

  const createProjectJsonPromise = fs.promises.writeFile(
    `${libRootAbsolutePath}/project.json`,
    generateProjectJSON(libName, libRoot),
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
