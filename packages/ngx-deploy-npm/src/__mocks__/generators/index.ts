import * as path from 'path';
import { ProjectConfiguration } from '@nx/devkit';

export const getLibPublishable = (libName: string): ProjectConfiguration => {
  const uniqName = `react-lib-${libName}`;

  return {
    root: `libs/${uniqName}`,
    sourceRoot: `libs/${uniqName}/src`,
    projectType: 'library',
    tags: [],
    targets: {
      build: {
        executor: '@nx/web:rollup',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/libs/${uniqName}`,
          tsConfig: `libs/${uniqName}/tsconfig.lib.json`,
          project: `libs/${uniqName}/package.json`,
          entryFile: `libs/${uniqName}/src/index.ts`,
          external: ['react/jsx-runtime'],
          rollupConfig: '@nx/react/plugins/bundle-rollup',
          compiler: 'babel',
          assets: [
            {
              glob: `libs/${uniqName}/README.md`,
              input: '.',
              output: '.',
            },
          ],
        },
      },
      lint: {
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`libs/${uniqName}/**/*.{ts,tsx,js,jsx}`],
        },
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/libs/${uniqName}`],
        options: {
          jestConfig: `libs/${uniqName}/jest.config.js`,
          passWithNoTests: true,
        },
      },
    },
  };
};

export const getLibPublishableWithProdMode = (
  libName: string
): ProjectConfiguration => {
  const uniqLibName = `angular-lib1-${libName}`;

  return {
    projectType: 'library',
    root: `packages/${uniqLibName}`,
    sourceRoot: `packages/${uniqLibName}/src`,
    // prefix: 'proj',
    targets: {
      build: {
        executor: '@nx/angular:package',
        outputs: [`dist/packages/${uniqLibName}`],
        options: {
          project: `packages/${uniqLibName}/ng-package.json`,
        },
        configurations: {
          production: {
            tsConfig: `packages/${uniqLibName}/tsconfig.lib.prod.json`,
          },
          development: {
            tsConfig: `packages/${uniqLibName}/tsconfig.lib.json`,
          },
        },
        defaultConfiguration: 'production',
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/packages/${uniqLibName}`],
        options: {
          jestConfig: `packages/${uniqLibName}/jest.config.js`,
          passWithNoTests: true,
        },
      },
      lint: {
        executor: '@nx/linter:eslint',
        options: {
          lintFilePatterns: [
            `packages/${uniqLibName}/src/**/*.ts`,
            `packages/${uniqLibName}/src/**/*.html`,
          ],
        },
      },
    },
    tags: [],
  };
};

export const getApplication = (appName: string): ProjectConfiguration => {
  const uniqAppName = `angular-app-${appName}`;

  return {
    projectType: 'application',
    root: `apps/${uniqAppName}`,
    sourceRoot: `apps/${uniqAppName}/src`,
    // prefix: 'proj',
    targets: {
      build: {
        executor: '@angular-devkit/build-angular:browser',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/apps/${uniqAppName}`,
          index: `apps/${uniqAppName}/src/index.html`,
          main: `apps/${uniqAppName}/src/main.ts`,
          polyfills: `apps/${uniqAppName}/src/polyfills.ts`,
          tsConfig: `apps/${uniqAppName}/tsconfig.app.json`,
          assets: [
            `apps/${uniqAppName}/src/favicon.ico`,
            `apps/${uniqAppName}/src/assets`,
          ],
          styles: `apps/${uniqAppName}/src/styles.css`,
          scripts: [],
        },
        configurations: {
          production: {
            budgets: [
              {
                type: 'initial',
                maximumWarning: '500kb',
                maximumError: '1mb',
              },
              {
                type: 'anyComponentStyle',
                maximumWarning: '2kb',
                maximumError: '4kb',
              },
            ],
            fileReplacements: [
              {
                replace: `apps/${uniqAppName}/src/environments/environment.ts`,
                with: `apps/${uniqAppName}/src/environments/environment.prod.ts`,
              },
            ],
            outputHashing: 'all',
          },
          development: {
            buildOptimizer: false,
            optimization: false,
            vendorChunk: true,
            extractLicenses: false,
            sourceMap: true,
            namedChunks: true,
          },
        },
        defaultConfiguration: 'production',
      },
      serve: {
        executor: '@angular-devkit/build-angular:dev-server',
        configurations: {
          production: {
            browserTarget: `${uniqAppName}:build:production`,
          },
          development: {
            browserTarget: `${uniqAppName}:build:development`,
          },
        },
        defaultConfiguration: 'development',
      },
      'extract-i18n': {
        executor: '@angular-devkit/build-angular:extract-i18n',
        options: {
          browserTarget: `${uniqAppName}:build`,
        },
      },
      lint: {
        executor: '@nx/linter:eslint',
        options: {
          lintFilePatterns: [
            `apps/${uniqAppName}/src/**/*.ts`,
            `apps/${uniqAppName}/src/**/*.html`,
          ],
        },
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/apps/${uniqAppName}`],
        options: {
          jestConfig: `apps/${uniqAppName}/jest.config.js`,
          passWithNoTests: true,
        },
      },
    },
    tags: [],
  };
};

export const getNonPublishableLib = (libName: string): ProjectConfiguration => {
  const uniqAppName = `angular-non-buildable-${libName}`;
  return {
    projectType: 'library',
    root: `packages/${uniqAppName}`,
    sourceRoot: `packages/${uniqAppName}/src`,
    // prefix: 'proj',
    targets: {
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/packages/${uniqAppName}`],
        options: {
          jestConfig: `packages/${uniqAppName}/jest.config.js`,
          passWithNoTests: true,
        },
      },
      lint: {
        executor: '@nx/linter:eslint',
        options: {
          lintFilePatterns: [
            `packages/${uniqAppName}/src/**/*.ts`,
            `packages/${uniqAppName}/src/**/*.html`,
          ],
        },
      },
    },
    tags: [],
  };
};

export const getLibWithNoSpecification = (
  libName: string
): ProjectConfiguration => {
  const uniqLibName = `nx-plugin-${libName}`;

  return {
    root: `packages/${uniqLibName}`,
    sourceRoot: `packages/${uniqLibName}/src`,
    targets: {
      build: {
        executor: '@nx/js:tsc',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/packages/${uniqLibName}`,
          main: `packages/${uniqLibName}/src/index.ts`,
          tsConfig: `packages/${uniqLibName}/tsconfig.lib.json`,
          assets: [
            'packages/${uniqLibName}/*.md',
            {
              input: `./packages/${uniqLibName}/src`,
              glob: '**/!(*.ts)',
              output: './src',
            },
            {
              input: `./packages/${uniqLibName}/src`,
              glob: '**/*.d.ts',
              output: './src',
            },
            {
              input: `./packages/${uniqLibName}`,
              glob: 'generators.json',
              output: '.',
            },
            {
              input: `./packages/${uniqLibName}`,
              glob: 'executors.json',
              output: '.',
            },
          ],
        },
      },
      lint: {
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`packages/${uniqLibName}/**/*.ts`],
        },
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/packages/${uniqLibName}`],
        options: {
          jestConfig: `packages/${uniqLibName}/jest.config.js`,
          passWithNoTests: true,
        },
      },
    },
    tags: [],
  };
};

export const mockProjectRoot = path.join('some', 'fake', 'root', 'folder');
