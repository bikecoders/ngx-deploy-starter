import { ProjectConfiguration } from '@nrwl/devkit';

export const getLibPublishable = (): ProjectConfiguration => ({
  root: 'libs/react-lib',
  sourceRoot: 'libs/react-lib/src',
  projectType: 'library',
  tags: [],
  targets: {
    build: {
      executor: '@nrwl/web:rollup',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: 'dist/libs/react-lib',
        tsConfig: 'libs/react-lib/tsconfig.lib.json',
        project: 'libs/react-lib/package.json',
        entryFile: 'libs/react-lib/src/index.ts',
        external: ['react/jsx-runtime'],
        rollupConfig: '@nrwl/react/plugins/bundle-rollup',
        compiler: 'babel',
        assets: [
          {
            glob: 'libs/react-lib/README.md',
            input: '.',
            output: '.',
          },
        ],
      },
    },
    lint: {
      executor: '@nrwl/linter:eslint',
      outputs: ['{options.outputFile}'],
      options: {
        lintFilePatterns: ['libs/react-lib/**/*.{ts,tsx,js,jsx}'],
      },
    },
    test: {
      executor: '@nrwl/jest:jest',
      outputs: ['coverage/libs/react-lib'],
      options: {
        jestConfig: 'libs/react-lib/jest.config.js',
        passWithNoTests: true,
      },
    },
  },
});

export const getLibPublishableWithProdMode = (): ProjectConfiguration => ({
  projectType: 'library',
  root: 'packages/angular-lib1',
  sourceRoot: 'packages/angular-lib1/src',
  // prefix: 'proj',
  targets: {
    build: {
      executor: '@nrwl/angular:package',
      outputs: ['dist/packages/angular-lib1'],
      options: {
        project: 'packages/angular-lib1/ng-package.json',
      },
      configurations: {
        production: {
          tsConfig: 'packages/angular-lib1/tsconfig.lib.prod.json',
        },
        development: {
          tsConfig: 'packages/angular-lib1/tsconfig.lib.json',
        },
      },
      defaultConfiguration: 'production',
    },
    test: {
      executor: '@nrwl/jest:jest',
      outputs: ['coverage/packages/angular-lib1'],
      options: {
        jestConfig: 'packages/angular-lib1/jest.config.js',
        passWithNoTests: true,
      },
    },
    lint: {
      executor: '@nrwl/linter:eslint',
      options: {
        lintFilePatterns: [
          'packages/angular-lib1/src/**/*.ts',
          'packages/angular-lib1/src/**/*.html',
        ],
      },
    },
  },
  tags: [],
});

export const getApplication = (): ProjectConfiguration => ({
  projectType: 'application',
  root: 'apps/angular-app',
  sourceRoot: 'apps/angular-app/src',
  // prefix: 'proj',
  targets: {
    build: {
      executor: '@angular-devkit/build-angular:browser',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: 'dist/apps/angular-app',
        index: 'apps/angular-app/src/index.html',
        main: 'apps/angular-app/src/main.ts',
        polyfills: 'apps/angular-app/src/polyfills.ts',
        tsConfig: 'apps/angular-app/tsconfig.app.json',
        assets: [
          'apps/angular-app/src/favicon.ico',
          'apps/angular-app/src/assets',
        ],
        styles: ['apps/angular-app/src/styles.css'],
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
              replace: 'apps/angular-app/src/environments/environment.ts',
              with: 'apps/angular-app/src/environments/environment.prod.ts',
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
          browserTarget: 'angular-app:build:production',
        },
        development: {
          browserTarget: 'angular-app:build:development',
        },
      },
      defaultConfiguration: 'development',
    },
    'extract-i18n': {
      executor: '@angular-devkit/build-angular:extract-i18n',
      options: {
        browserTarget: 'angular-app:build',
      },
    },
    lint: {
      executor: '@nrwl/linter:eslint',
      options: {
        lintFilePatterns: [
          'apps/angular-app/src/**/*.ts',
          'apps/angular-app/src/**/*.html',
        ],
      },
    },
    test: {
      executor: '@nrwl/jest:jest',
      outputs: ['coverage/apps/angular-app'],
      options: {
        jestConfig: 'apps/angular-app/jest.config.js',
        passWithNoTests: true,
      },
    },
  },
  tags: [],
});

export const getNonPublishableLib = (): ProjectConfiguration => ({
  projectType: 'library',
  root: 'packages/angular-non-buildable',
  sourceRoot: 'packages/angular-non-buildable/src',
  // prefix: 'proj',
  targets: {
    test: {
      executor: '@nrwl/jest:jest',
      outputs: ['coverage/packages/angular-non-buildable'],
      options: {
        jestConfig: 'packages/angular-non-buildable/jest.config.js',
        passWithNoTests: true,
      },
    },
    lint: {
      executor: '@nrwl/linter:eslint',
      options: {
        lintFilePatterns: [
          'packages/angular-non-buildable/src/**/*.ts',
          'packages/angular-non-buildable/src/**/*.html',
        ],
      },
    },
  },
  tags: [],
});

export const getLibWithNoSpecification = (): ProjectConfiguration => ({
  root: 'packages/nx-plugin',
  sourceRoot: 'packages/nx-plugin/src',
  targets: {
    build: {
      executor: '@nrwl/js:tsc',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: 'dist/packages/nx-plugin',
        main: 'packages/nx-plugin/src/index.ts',
        tsConfig: 'packages/nx-plugin/tsconfig.lib.json',
        assets: [
          'packages/nx-plugin/*.md',
          {
            input: './packages/nx-plugin/src',
            glob: '**/!(*.ts)',
            output: './src',
          },
          {
            input: './packages/nx-plugin/src',
            glob: '**/*.d.ts',
            output: './src',
          },
          {
            input: './packages/nx-plugin',
            glob: 'generators.json',
            output: '.',
          },
          {
            input: './packages/nx-plugin',
            glob: 'executors.json',
            output: '.',
          },
        ],
      },
    },
    lint: {
      executor: '@nrwl/linter:eslint',
      outputs: ['{options.outputFile}'],
      options: {
        lintFilePatterns: ['packages/nx-plugin/**/*.ts'],
      },
    },
    test: {
      executor: '@nrwl/jest:jest',
      outputs: ['coverage/packages/nx-plugin'],
      options: {
        jestConfig: 'packages/nx-plugin/jest.config.js',
        passWithNoTests: true,
      },
    },
  },
  tags: [],
});
