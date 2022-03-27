# ngx-deploy-npm 🚀 <!-- omit in toc -->

[![NPM version][npm-image]][npm-url]
[![NPM donwoads][downloads-image]][npm-url]
[![The MIT License][mit-licence-image]][mit-licence-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]

[![Reliability Rating][sonar-reliability-image]][sonar-link]
[![Security Rating][sonar-security-image]][sonar-link]
[![Maintainability Rating][sonar-maintainability-image]][sonar-link]

[![Publishment Status][publishment-image]][publishment-link]

<!-- Images -->

[sonar-reliability-image]: https://sonarcloud.io/api/project_badges/measure?project=bikecoders_ngx-deploy-npm&metric=reliability_rating
[sonar-security-image]: https://sonarcloud.io/api/project_badges/measure?project=bikecoders_ngx-deploy-npm&metric=security_rating
[sonar-maintainability-image]: https://sonarcloud.io/api/project_badges/measure?project=bikecoders_ngx-deploy-npm&metric=sqale_rating
[publishment-image]: https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/publishment.yml/badge.svg?branch=master
[npm-image]: https://badge.fury.io/js/ngx-deploy-npm.svg
[mit-licence-image]: https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square
[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[downloads-image]: https://img.shields.io/npm/dm/ngx-deploy-npm

<!-- URLs -->

[sonar-link]: https://sonarcloud.io/summary/new_code?id=bikecoders_ngx-deploy-npm
[publishment-link]: https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/publishment.yml
[npm-url]: https://www.npmjs.com/package/ngx-deploy-npm
[mit-licence-url]: http://opensource.org/licenses/MIT
[conventional-commits-url]: https://conventionalcommits.org

![Cover Image](docs/cover.png)

## Publish your libraries to NPM with one command on an Angular🅰️ or Nx🐬 workspace <!-- omit in toc -->

---

**Table of contents:**

- [🚀 Quick Start (local development)](#quick-start-local-development)
- [🚀 Continuous Delivery](#continuous-delivery)
- [❓What is done when executing `nx deploy`](#what-is-done-when-executing-nx-deploy)
- [📦 Options](#options)
  - [install/ng-add](#installng-add)
    - [--projects](#--projects)
  - [deploy](#deploy)
    - [--build-target](#--build-target)
    - [--no-build](#--no-build)
    - [--package-version](#--package-version)
    - [--tag](#--tag)
    - [--access](#--access)
    - [--otp](#--otp)
    - [--dry-run](#--dry-run)
- [📁 Configuration File](#configuration-file)
- [🧐 Essential considerations](#essential-considerations)
  - [Version Generation](#version-generation)
- [🎉 Do you Want to Contribute?](#do-you-want-to-contribute)
- [License](#license)
- [Recognitions](#recognitions)

---

> **Note:** all the examples are focused on Nx; if you don't see an
> explicit command for an Angular workspace change `nx` for `ng`.
>
> Also, when you find references to `workspace.json`, you can find your file under the name `angular.json`.

## 🚀 Quick Start (local development) <a name="quick-start-local-development"></a>

1. Add `ngx-deploy-npm` to your project. It will configure all your publishable libraries present in the project:

   - Nx🐬

     ```bash
     npm install --save-dev ngx-deploy-npm
     nx generate ngx-deploy-npm:install
     ```

   - Angular🅰️

     ```bash
     ng add ngx-deploy-npm
     ```

2. Deploy your library to NPM with all default settings.

   ```sh
   nx deploy your-library --dry-run
   ```

3. When you are happy with the result, remove the `--dry-run` option

## 🚀 Continuous Delivery <a name="continuous-delivery"></a>

Independently of the CI/CD you are using, you need an NPM token. To do so, you have two methods.

- Via [NPM web page](https://docs.npmjs.com/creating-and-viewing-authentication-tokens)
- Using [`npm token create`](https://docs.npmjs.com/cli/token.html)

### [CircleCI](http://circleci.com) <!-- omit in toc -->

1. Set the env variable
   - On your project setting the env variable. Let's call it `NPM_TOKEN`
2. Indicate how to find the token
   - Before publishing, we must indicate to npm how to find that token,
     do it by creating a step with `run: echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > YOUR_REPO_DIRECTORY/.npmrc`
   - Replace `YOUR_REPO_DIRECTORY` for the path of your project,
     commonly is `/home/circleci/repo`
3. **(Optional) check that you are logged**
   - Creating a step with `run: npm whoami`
   - The output should be the username of your npm account
4. Deploy your package

   - Create a step with:

   | Nx🐬                                        | Angular🅰️                                   |
   | :------------------------------------------ | :------------------------------------------ |
   | <pre lang="sh">nx deploy your-library</pre> | <pre lang="sh">ng deploy your-library</pre> |

5. Enjoy your just-released package 🎉📦

The complete job example is:

```yml
# .circleci/config.yml
jobs:
  init-deploy:
    executor: my-executor
    steps:
      - attach_workspace:
          at: /home/circleci/repo/
      # Set NPM token to be able to publish
      - run: echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > /home/circleci/repo/.npmrc
      - run: npm whoami
      - run: npx nx deploy YOUR_PACKAGE
```

> You can check the steps suggested in the [CircleCI's guide](https://circleci.com/blog/publishing-npm-packages-using-circleci-2-0/)

## ❓What is done when executing `nx deploy` <a name="what-is-done-when-executing-nx-deploy"></a>

1. Will build the application using the target `build`
   - This will be omitted if the parameter `--no-build` is set
2. Execute `npm publish`

The following is the activity diagram.

![Execution activity diagram](docs/UML/principal-activity-diagram.jpg)

## 📦 Options <a name="options"></a>

### install/ng-add

#### --projects

- **optional**
- Default: Doesn't have any default value (array string)
- Example:
  - `nx generate ngx-deploy-npm:install --projects=lib-1,lib-2` – Only `lib-1` and `lib-2` are going to be configurated

Specify which libraries should be configurated. Useful when you have a workspace with several libraries and don't want to overwrite existing configuration
Should be `,` separated, without spaces.

### deploy

#### --build-target

- **optional**
- Default: Doesn't have any default value (string)
- Example:
  - `nx deploy --build-target=production` – The configuration `production` is being used to build your package

The `buildTarget` points to an existing target configuration on your project,
as specified in the `configurations` section of `workspace.json`.

This option is equivalent to calling the command `nx build --configuration=XXX`.
This command has no effect if the option `--no-build` option is active.

#### --no-build

- **optional**
- Default: `false` (string)
- Example:
  - `nx deploy` – The library is built in production mode before the deployment
  - `nx deploy --no-build` – The library is NOT built, but the deployment process is being made

Skip build process during deployment.
This option is useful when the building process is handled by something else.
This command causes the `--build-target` setting to have no effect.

#### --package-version

- **optional**
- Default: Doesn't have any default value (string)
- Example:
  - `nx deploy --package-version 2.3.4`

It's going to put that version on your `package.json` and publish the library with that version on NPM.

#### --tag

- **optional**
- Default: `latest` (string)
- Example:
  - `nx deploy --tag alpha` – Your package will be available for download using that tag, `npm install your-package@alpha` useful for RC versions, alpha, betas.

Registers the published package with the given tag, such that `npm install @` will install this version. By default, `npm publish` updates and `npm install` installs the `latest` tag. See [`npm-dist-tag`](https://docs.npmjs.com/cli/dist-tag) for details about tags.

#### --access

- Default: `public` (string)
- Example:
  - `nx deploy --access public`

Tells the registry whether to publish the package as public or restricted. It only applies to scoped packages, which default to restricted. If you don't have a paid account, you must publish with --access public to publish scoped packages.

#### --otp

- **optional**
- Default: Doesn't have any default value (string)
- Example:
  - `nx deploy --otp TOKEN`

If you have two-factor authentication enabled in auth-and-writes mode, you can provide a code from your authenticator.

#### --dry-run

- **optional**
- Default: `false` (boolean)
- Example:
  - `nx deploy --dry-run`

For testing: Run through without making any changes. Execute with `--dry-run`, and nothing will happen. It will show a list of the options used on the console.

## 📁 Configuration File <a name="configuration-file"></a>

To avoid all these command-line cmd options, you can write down your
configuration in the `workspace.json` file in the `options` attribute
of your deploy project's executor.
Just change the option to lower camel case.

A list of all available options is also available [here](https://github.com/bikecoders/ngx-deploy-npm/blob/master/src/deploy/schema.json).

Example:

```sh
nx deploy your-library --tag alpha --access public --dry-run
```

becomes

```json
"deploy": {
  "executor": "ngx-deploy-npm:deploy",
  "options": {
    "tag": "alpha",
    "access": "public",
    "dryRun": true
  }
}
```

Now you can just run `nx deploy YOUR-LIBRARY` without all the options in the command line! 😄

> ℹ️ You can always use the [--dry-run](#dry-run) option to verify if your configuration is correct.

## 🧐 Essential considerations <a name="essential-considerations"></a>

### README and LICENCE files <!-- omit in toc -->

Those files must be at the root of the library. The executor is copying them at the moment of building.

If you have those files outside the project's root, use the `assets` option on the executor that compiles your application.

### Version Generation

This deployer doesn't bump or generate a new package version; here, we care about doing one thing well, publish your libs to NPM. You can change the version package at publishment using the [`--package-version`](#--package-version) option.

We strongly recommend using [`@jscutlery/semver`](https://github.com/jscutlery/semver) to generate your package's version based on your commits automatically. When a new version is generated you can specify to publish it using `ngx-deploy-npm`.

For more information go to semver's [documentation](https://github.com/jscutlery/semver#triggering-executors-post-release)

We use `@jscutlery/semver` here on `ngx-deploy-npm` to generate the package's next version, and we use `ngx-deploy-npm` to publish that version to NPM. Yes, it uses itself, take a look by yourself [ngx-deploy-npm/project.json](https://github.com/bikecoders/ngx-deploy-npm/blob/master/packages/ngx-deploy-npm/project.json#L55-L67)

### Only publishable libraries are being configured <!-- omit in toc -->

For an Nx workspace, only publishable libraries are going to be configured.

## 🎉 Do you Want to Contribute? <a name="do-you-want-to-contribute"></a>

We create a unique document for you to give you through this path.

[Readme for Contributors](./docs/README_contributors.md)

## License

Code released under the [MIT license](LICENSE).

## Recognitions

- 🚀 Initially Powered By [ngx-deploy-starter](https://github.com/angular-schule/ngx-deploy-starter)
