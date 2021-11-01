# ngx-deploy-npm 🚀 <!-- omit in toc -->

[![NPM version][npm-image]][npm-url]
[![NPM donwoads][downloads-image]][npm-url]
[![The MIT License][mit-licence-image]][mit-licence-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]

[![Build Test E2E][nightly-version-image]][nightly-version-link]

<!-- Images -->

[nightly-version-image]: https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/nightly-version-health.yml/badge.svg
[npm-image]: https://badge.fury.io/js/ngx-deploy-npm.svg
[mit-licence-image]: https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square
[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[downloads-image]: https://img.shields.io/npm/dm/ngx-deploy-npm

<!-- URLs -->

[nightly-version-link]: https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/nightly-version-health.yml
[npm-url]: https://www.npmjs.com/package/ngx-deploy-npm
[mit-licence-url]: http://opensource.org/licenses/MIT
[conventional-commits-url]: https://conventionalcommits.org

![Cover Image](docs/cover.png)

## Publish your libraries to NPM with one command on an Angular🅰️ or Nx🐬 workspace <!-- omit in toc -->

---

**Table of contents:**

- [🚀 Quick Start (local development)](#quick-start)
- [🚀 Continuous Delivery](#continuous-delivery)
- [📦 Options](#options)
  - [--build-target](#--build-target)
  - [--no-build](#--no-build)
  - [--package-version](#--package-version)
  - [--tag](#--tag)
  - [--access](#--access)
  - [--otp](#--otp)
  - [--dry-run](#--dry-run)
- [📁 Configuration File](#configuration-file)
- [🧐 Essential considerations](#essential-considerations)
- [🏁 Next milestones](#next-milestones)
- [🎉 Do you Want to Contribute?](#want-to-contribute)
- [License](#license)
- [Recognitions](#recognitions)

---

> **Note:** all the examples are focused on Nx, if you don't see an
> explicit command for an Angular workspace just change `nx` for `ng`.
>
> Also, when you find references to `workspace.json`, you can find your file under the name `angular.json`.

## 🚀 Quick Start (local development) <a name="quick-start"></a>

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

Independently of the CI/CD that you are using you must create an NPM token. To do so, you have two methods

- Via [NPM web page](https://docs.npmjs.com/creating-and-viewing-authentication-tokens)
- Using [`npm token create`](https://docs.npmjs.com/cli/token.html)

### [CircleCI](http://circleci.com) <!-- omit in toc -->

1. Set the env variable
   - On your project setting ser the env variable. Let's call it `NPM_TOKEN`
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

5. Enjoy your just released package 🎉📦

The job full example is for an Angular project is

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

## 📦 Options <a name="options"></a>

#### --build-target

- **optional**
- Default: Doesn't have any default value (string)
- Example:
  - `nx deploy --build-target=production` – The configuration `production` is being used to build your package

The `buildTarget` simply points to an existing target configuration on your project,
as specified in the `configurations` section of `workspace.json`.

This is equivalent to calling the command `nx build --configuration=XXX`.
This command has no effect if the option `--no-build` option is active.

#### --no-build

- **optional**
- Default: `false` (string)
- Example:
  - `nx deploy` – Angular project is build in production mode before the deployment
  - `nx deploy --no-build` – Angular project is NOT build

Skip build process during deployment.
This can be used when you are sure that you haven't changed anything and want to deploy with the latest artifact.
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

Tells the registry whether this package should be published as public or restricted. It only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.

#### --otp

- **optional**
- Default: Doesn't have any default value (string)
- Example:
  - `nx deploy --otp TOKEN`

If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this.

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
    "dryRun": "true"
  }
}
```

Now you can just run `nx deploy YOUR-LIBRARY` without all the options in the command line! 😄

> ℹ️ You can always use the [--dry-run](#dry-run) option to verify if your configuration is right.

## 🧐 Essential considerations <a name="essential-considerations"></a>

### README and LICENCE files <!-- omit in toc -->

Those files must be at the root of the library. The executor is copying them at the moment of building.

If you have those files outside the project's root, use the option `assets` on the executor that compiles your application.

### Version bumping <!-- omit in toc -->

This deployer doesn't bump or generates a new version of the package, it just builds the **package/library**, take the package.json as it and **publish** it. You can use [`--package-version`](#--package-version) option to change it.

### Only publishable libraries are being configured <!-- omit in toc -->

For Nx workspace, only publishable libraries are going to be configured

## 🏁 Next milestones <a name="next-milestones"></a>

We are looking forward to the following features:

- Implement Continuous Everything with Github Actions
- Specify which library configure the builder on the installment (`init`)

Your feature that's not on the list yet?

We look forward to any help. PRs are welcome! 😃

## 🎉 Do you Want to Contribute? <a name="want-to-contribute"></a>

We create a special document for you to give you through this path

[Readme for Contributors](./docs/README_contributors.md)

## License

Code released under the [MIT license](LICENSE).

## Recognitions

- 🚀 Initially Powered By [ngx-deploy-starter](https://github.com/angular-schule/ngx-deploy-starter)
